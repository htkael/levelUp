import client from "../../pg-cli.js";

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
    return res.status.send({ success: false, error: "Failed to fetch dashboard data" })
  } finally {
    pg.release()
  }
}
