import client from "../../../pg-cli.js";
import { getUserGroupRole } from "../../../shared/dbFuncs.js";
import { Logger } from "../../../shared/logger.js";
import { calculateStreak, formatRelativeDate } from "../../../shared/utils.js";

export async function getDashStats(req, res) {
  const pg = await client.connect()

  try {
    const user = res?.locals?.user

    const [statsResult, recentActivitiesResult, categoriesResult, entryDatesResult, goalsResult] = await Promise.all([
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
        SELECT DISTINCT "entryDate"::date as "entryDate"
        FROM "ProgressEntry"
        WHERE "userId" = $1
        ORDER BY "entryDate" DESC
      `, [user.id]),

      pg.query(`
        SELECT
          g.*,
          a.name as "activityName",
          c.name as "categoryName",
          am."metricName" as "metricName",
          am."metricType" as "metricType",
          am.unit as "metricUnit",
            (
              SELECT COALESCE(SUM(pm.value), 0)
              FROM "ProgressMetric" pm
              JOIN "ProgressEntry" pe ON pm."entryId" = pe.id
              WHERE pm."metricId" = g."metricId"
              AND pe."activityId" = g."activityId"
              AND pe."entryDate" >= g."startDate"
              AND pe."entryDate" <= LEAST(g."endDate", CURRENT_DATE)
            ) as "currentProgress",
            EXTRACT(DAYS FROM AGE(CURRENT_DATE, g."startDate")) as "daysElapsed",
            GREATEST(0, EXTRACT(DAYS FROM AGE(g."endDate", CURRENT_DATE))) as "daysRemaining",
            EXTRACT(DAYS FROM AGE(g."endDate", g."startDate")) as "totalDays",
            (
              SELECT MAX(pe."entryDate")
              FROM "ProgressMetric" pm
              JOIN "ProgressEntry" pe ON pm."entryId" = pe.id
              WHERE pm."metricId" = g."metricId"
              AND pe."activityId" = g."activityId"
              AND pe."entryDate" >= g."startDate"
              AND pe."entryDate" <= g."endDate"
            ) as "lastEntryDate"
        FROM "Goal" g
        LEFT JOIN "Activity" a ON g."activityId" = a.id
        LEFT JOIN "Category" c ON a."categoryId" = c.id
        LEFT JOIN "ActivityMetric" am ON g."metricId" = am.id
        WHERE g."userId" = $1
        AND g."isActive" = true
        ORDER BY g."endDate" ASC
        LIMIT 5
      `, [user.id])
    ])

    const currentStreak = calculateStreak(entryDatesResult.rows)
    const stats = statsResult.rows[0]
    const goals = goalsResult.rows.map((goal) => ({
      ...goal,
      percentageComplete: goal.targetValue > 0
        ? (parseFloat(goal.currentProgress) / parseFloat(goal.targetValue) * 100)
        : 0,
      daysElapsed: Math.floor(goal.daysElapsed),
      daysRemaining: Math.floor(goal.daysRemaining),
      totalDays: Math.floor(goal.totalDays)
    }))

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
        id: cat.id,
        name: cat.name,
        color: cat.color,
        activities: parseInt(cat.activities),
        lastEntry: cat.lastEntry ? formatRelativeDate(cat.lastEntry) : "No entries"
      })),
      goals
    })

  } catch (error) {
    Logger.error("Dashboard query error", { error: error?.message || error })
    return res.status(500).send({ success: false, error: "Failed to fetch dashboard data" })
  } finally {
    pg.release()
  }
}

export async function getGroupDashStats(req, res) {
  try {
    const user = res?.locals?.user

    const { groupId } = req.body

    if (!groupId) {
      throw new Error("Group id required")
    }

    const role = await getUserGroupRole(user, groupId)

    if (role?.error) {
      throw new Error(role.error)
    }
    if (!role) {
      throw new Error("User does not belong to group")
    }

    const [statsResult, recentActivitiesResult, categoriesResult, entryDatesResult, goalsResult, leaderboardResult] = await Promise.all([
      client.query(`
        SELECT
          (SELECT COUNT(*) FROM "Category" WHERE "groupId" = $1) as "totalCategories",
          (
            SELECT COUNT(pe.id)
            FROM "ProgressEntry" pe
            JOIN "Activity" a ON a.id = pe."activityId"
            WHERE a."groupId" = $1
            AND pe."entryDate" >= DATE_TRUNC('week', CURRENT_DATE)
          ) as "weeklyActivities",
          (
            SELECT COUNT(pe.id)
            FROM "ProgressEntry" pe
            JOIN "Activity" a ON a.id = pe."activityId"
            WHERE a."groupId" = $1
          ) as "totalEntries"
      `, [groupId]),

      client.query(`
        SELECT
          pe.id,
          pe."entryDate" as date,
          a.name as activity,
          c.name as category,
          u.id as "userId",
          u.username,
          STRING_AGG(
            CONCAT(am."metricName", ': ', pm.value, ' ', COALESCE(am.unit, '')),
            ', '
          ) as metric
        FROM "ProgressEntry" pe
        JOIN "User" u ON pe."userId" = u.id
        JOIN "Activity" a ON pe."activityId" = a.id
        JOIN "Category" c ON a."categoryId" = c.id
        LEFT JOIN "ProgressMetric" pm ON pm."entryId" = pe.id
        LEFT JOIN "ActivityMetric" am ON pm."metricId" = am.id
        WHERE a."groupId" = $1
        GROUP BY pe.id, pe."entryDate", a.name, c.name, u.id, u.username
        ORDER BY pe."entryDate" DESC, pe."createdAt" DESC
        LIMIT 5
      `, [groupId]),

      client.query(`
        SELECT
          c.id,
          c.name,
          c.color,
          COUNT(DISTINCT a.id) as activities,
          MAX(pe."entryDate") as "lastEntry"
          FROM "Category" c
          LEFT JOIN "Activity" a ON a."categoryId" = c.id AND a."groupId" = $1
          LEFT JOIN "ProgressEntry" pe ON pe."activityId" = a.id
          WHERE c."groupId" = $1
          GROUP BY c.id, c.name, c.color
          ORDER BY "lastEntry" DESC NULLS LAST
          LIMIT 5
      `, [groupId]),

      client.query(`
        SELECT DISTINCT pe."entryDate"::date as "entryDate"
        FROM "ProgressEntry" pe
        JOIN "Activity" a ON a.id = pe."activityId"
        WHERE a."groupId" = $1
        ORDER BY "entryDate" DESC
      `, [groupId]),

      client.query(`
        SELECT
          g.*,
          a.name as "activityName",
          c.name as "categoryName",
          am."metricName" as "metricName",
          am."metricType" as "metricType",
          am.unit as "metricUnit",
            (
              SELECT COALESCE(SUM(pm.value), 0)
              FROM "ProgressMetric" pm
              JOIN "ProgressEntry" pe ON pm."entryId" = pe.id
              WHERE pm."metricId" = g."metricId"
              AND pe."activityId" = g."activityId"
              AND pe."entryDate" >= g."startDate"
              AND pe."entryDate" <= LEAST(g."endDate", CURRENT_DATE)
            ) as "currentProgress",
            EXTRACT(DAYS FROM AGE(CURRENT_DATE, g."startDate")) as "daysElapsed",
            GREATEST(0, EXTRACT(DAYS FROM AGE(g."endDate", CURRENT_DATE))) as "daysRemaining",
            EXTRACT(DAYS FROM AGE(g."endDate", g."startDate")) as "totalDays",
            (
              SELECT MAX(pe."entryDate")
              FROM "ProgressMetric" pm
              JOIN "ProgressEntry" pe ON pm."entryId" = pe.id
              WHERE pm."metricId" = g."metricId"
              AND pe."activityId" = g."activityId"
              AND pe."entryDate" >= g."startDate"
              AND pe."entryDate" <= g."endDate"
            ) as "lastEntryDate"
        FROM "Goal" g
        LEFT JOIN "Activity" a ON g."activityId" = a.id
        LEFT JOIN "Category" c ON a."categoryId" = c.id
        LEFT JOIN "ActivityMetric" am ON g."metricId" = am.id
        WHERE g."groupId" = $1
        AND g."isActive" = true
        ORDER BY g."endDate" ASC
        LIMIT 5
      `, [groupId]),

      client.query(`
        SELECT
        u.id,
        u.username,
        COUNT(pe.id) as "entryCount"
        FROM "ProgressEntry" pe
        JOIN "User" u ON pe."userId" = u.id
        JOIN "UserGroup" ug ON ug."userId" = u.id
        JOIN "Activity" a ON a.id = pe."activityId"
        WHERE ug."groupId" = $1
        AND a."groupId" = $1
        GROUP BY u.id, u.username
        ORDER by COUNT(pe.id) DESC
        LIMIT 5
      `, [groupId])

    ])

    const currentStreak = calculateStreak(entryDatesResult.rows)
    const stats = statsResult.rows[0]
    const goals = goalsResult.rows.map((goal) => ({
      ...goal,
      percentageComplete: goal.targetValue > 0
        ? (parseFloat(goal.currentProgress) / parseFloat(goal.targetValue) * 100)
        : 0,
      daysElapsed: Math.floor(goal.daysElapsed),
      daysRemaining: Math.floor(goal.daysRemaining),
      totalDays: Math.floor(goal.totalDays)
    }))
    const leaderboard = leaderboardResult.rows


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
        userId: activity.userId,
        username: activity.username,
        date: activity.date.toISOString().split("T")[0],
        metric: activity.metric || "No metric"

      })),
      categories: categoriesResult.rows.map(cat => ({
        name: cat.name,
        color: cat.color,
        activities: parseInt(cat.activities),
        lastEntry: cat.lastEntry ? formatRelativeDate(cat.lastEntry) : "No entries"
      })),
      goals,
      leaderboard
    })

  } catch (error) {
    Logger.error("Group dashboard query error", { error: error?.message || error })
    return res.status(500).send({ success: false, error: "Failed to fetch group dashboard data" })
  }
}
