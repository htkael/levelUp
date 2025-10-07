import client from "../../pg-cli.js";
import { Logger } from "../../shared/logger.js";

export async function getDashStats(req, res) {
  const pg = await client.connect()

  try {
    const user = res?.locals?.user

    const [statsResult, recentActivitiesResult, categoriesResult, entryDatesResult] = await Promise.all([
      pg.query(`
        SELECT
          (SELECT COUNT(*) FROM "Category" WHERE "userId" = $1) as "totalCategories",
          (SELECT COUNT(*) FROM "ProgressEntry" WHERE "userId" = $1
          AND "entryDate" >= DATE_TRUNC('week', CURRENT_DATE)) as "weeklyActivities",
          (SELECT COUNT(*) FROM "ProgressEntry" WHERE "userId" = $1) as "totalEntries"
      `, [user.id]),

      pg.query(`
        SELECT
          pe.id,
          pe."entryDate" as date,
          a.name as activity,
          c.name as category,
          STRING_AGG(
            CONCAT(am."metricName", ': ', pm.value, ' ', COALESCE(am.unit, '')),
            ', '
          ) as metric
        FROM "ProgressEntry" pe
        JOIN "Activity" a ON pe."activityId" = a.id
        JOIN "Category" c ON a."categoryId" = c.id
        LEFT JOIN "ProgressMetric" pm ON pm."entryId" = pe.id
        LEFT JOIN "ActivityMetric" am ON pm."metricId" = am.id
        WHERE pe."userId" = $1
        GROUP BY pe.id, pe."entryDate", a.name, c.name
        ORDER BY pe."entryDate" DESC, pe."createdAt" DESC
        LIMIT 5
      `, [user.id]),

      pg.query(`
        SELECT
          c.id,
          c.name,
          c.color,
          COUNT(DISTINCT a.id) as activities,
          MAX(pe."entryDate") as "lastEntry"
          FROM "Category" c
          LEFT JOIN "Activity" a ON a."categoryId" = c.id AND a."userId" = $1
          LEFT JOIN "ProgressEntry" pe ON pe."activityId" = a.id AND pe."userId" = $1
          WHERE c."userId" = $1
          GROUP BY c.id, c.name, c.color
          ORDER BY "lastEntry" DESC NULLS LAST
          LIMIT 5
      `, [user.id]),

      pg.query(`
        SELECT DISTINCT "entryDate"::date as entry_date
        FROM "ProgressEntry"
        WHERE "userId" = $1
        ORDER BY entry_date DESC
      `, [user.id])
    ])

    const currentStreak = calculateStreak(entryDatesResult.rows)
    const stats = statsResult.rows[0]

    return res.send({
      success: true,
      stats: {
        totalCategories: parseInt(stats.totalCategories),
        weeklyActivities: parseInt(stats.weeklyActivities),
        currentStreak: currentStreak,
        totalEntries: parseInt(stats.totalEntries)
      },
      recentActivities: recentActivitiesResult.rows.map(activity => ({
        id: activity.id,
        category: activity.category,
        activity: activity.activity,
        date: activity.date.toISOString().split("T")[0],
        metric: activity.metric || "No metric"

      })),
      categories: categoriesResult.rows.map(cat => ({
        name: cat.name,
        color: cat.color,
        activities: parseInt(cat.activities),
        lastEntry: cat.lastEntry ? formatRelativeDate(cat.lastEntry) : "No entries"
      }))
    })

  } catch (error) {
    Logger.error("Dashboard query error", { error: error?.message || error })
    return res.status(500).send({ success: false, error: "Failed to fetch dashboard data" })
  } finally {
    pg.release()
  }
}

function calculateStreak(dateRows) {
  if (dateRows.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const entryDates = dateRows.map(row => {
    const date = new Date(row.entry_date)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  })

  const todayTime = today.getTime()
  const yesterdayTime = yesterday.getTime()

  if (entryDates[0] !== todayTime && entryDates[0] !== yesterdayTime) {
    return 0
  }

  let streak = 1
  let expectedNext = entryDates[0] = (24 * 60 * 60 * 1000)

  for (let i = 1; i < entryDates.length; i++) {
    if (entryDates[i] === expectedNext) {
      streak++
      expectedNext -= (24 * 60 * 60 * 1000)
    } else {
      break
    }
  }

  return streak
}

function formatRelativeDate(date) {
  const today = new Date()
  const entryDate = new Date(date)
  const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`

  return entryDate.toISOString().split("T")[0]
}
