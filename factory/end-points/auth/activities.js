import { CreateAndLog, UpdateAndLog, DeleteAndLog, getGenericById, getUserGroupRole } from "../../shared/dbFuncs.js";
import pg from "../../pg-cli.js";
import { Logger } from "../../shared/logger.js";
import { calculateStreak, calculateLongestStreak } from "../../shared/utils.js";

export async function getActivityBasic(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { id } = req.body

    let activity = await getGenericById("Activity", id)

    if (!activity) {
      throw new Error("Original activity not found")
    }

    let metrics = (await pg.query(`
      SELECT "metricName", "metricType", "unit", "isPrimary"
      FROM "ActivityMetric"
      WHERE "activityId" = $1
    `, [activity.id])).rows

    activity.metrics = metrics

    return res.send({ success: true, activity })
  } catch (error) {
    Logger.error("Unable to get basic activity info", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function listActivities(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }
    const { groupId, isActive, categoryId } = req.body
    let searchField = "userId"
    let searchValue = []
    if (groupId) {
      searchField = "groupId"
      searchValue.push(groupId)
    } else {
      searchValue.push(user.id)
    }

    let filterClause = `WHERE a."${searchField}" = $1 `
    if (isActive !== undefined) {
      filterClause += `AND a."isActive" = $2 `
      searchValue.push(isActive)
    }
    if (categoryId) {
      const paramNum = searchValue.length + 1
      filterClause += `AND a."categoryId" = $${paramNum} `
      searchValue.push(categoryId)
    }

    const activities = (await pg.query(`
      SELECT
        a.*,
        c.name as "categoryName",
        c.color as "categoryColor",
        COUNT(DISTINCT am.id) as "metricCount",
        MAX(pe."entryDate") as "lastEntryDate",
        COUNT(DISTINCT pe.id) as "totalEntries",
        (
          SELECT "metricName"
          FROM "ActivityMetric"
          WHERE "activityId" = a.id AND "isPrimary" = true
          LIMIT 1
        ) as "primaryMetricName",
        (
          SELECT pm.value
          FROM "ProgressEntry" pe2
          JOIN "ProgressMetric" pm ON pm."entryId" = pe2.id
          JOIN "ActivityMetric" am2 ON am2.id = pm."metricId"
          WHERE pe2."activityId" = a.id
            AND am2."isPrimary" = true
          ORDER BY pe2."entryDate" DESC
          LIMIT 1
        ) as "primaryMetricLastValue"
      FROM "Activity" a
      LEFT JOIN "Category" c ON c.id = a."categoryId"
      LEFT JOIN "ActivityMetric" am ON am."activityId" = a.id
      LEFT JOIN "ProgressEntry" pe ON pe."activityId" = a.id
      ${filterClause}
      GROUP BY a.id, c.name, c.color
      ORDER BY a."createdAt" DESC
    `, searchValue)).rows

    return res.send({ success: true, activities })
  } catch (error) {
    Logger.error("Error listing activities", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function getActivityStats(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { id } = req.body

    if (!id) {
      throw new Error("Activity id required")
    }

    const [overviewResult, metricStats, entryDatesResult, comparisonResult, recentActivityResult, goalsResult] = await Promise.all([
      pg.query(`
        SELECT
          COUNT(pe.id) as "totalEntries",
          MIN(pe."entryDate") as "firstEntry",
          MAX(pe."entryDate") as "lastEntry",
          a."isActive" as "isActive",
          c.name as "categoryName"
        FROM "Activity" a
        LEFT JOIN "ProgressEntry" pe ON pe."activityId" = a.id
        JOIN "Category" c ON c.id = a."categoryId"
        WHERE a.id = $1
        GROUP BY a.id, a."isActive", c.name
      `, [id]),
      pg.query(`
        SELECT
          am.id as "metricId",
          am."metricName",
          am."metricType",
          am.unit,
          MAX(pe."entryDate") as "mostRecent",
          MIN(pm.value) as "minValue",
          MAX(pm.value) as "maxValue",
          AVG(pm.value) as "averageValue",
          SUM(pm.value) as "cumulativeValue"
        FROM "ActivityMetric" am
        LEFT JOIN "ProgressMetric" pm ON pm."metricId" = am.id
        JOIN "ProgressEntry" pe ON pe.id = pm."entryId" AND pe."activityId" = $1
        WHERE am."activityId" = $1
        GROUP BY am.id, am."metricName", am."metricType", am.unit
      `, [id]),

      pg.query(`
        SELECT COUNT(*)
        FROM "ProgressEntry"
        WHERE "activityId" = $1
        AND "entryDate" >= DATE_TRUNC('week', CURRENT_DATE)
      `, [id]),

      pg.query(`
        SELECT COUNT(*)
        FROM "ProgressEntry"
        WHERE "activityId" = $1
        AND "entryDate" >= DATE_TRUNC('month', CURRENT_DATE)
      `, [id]),

      pg.query(`
        SELECT
          pe.id,
          pe."entryDate",
          pe.notes,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'value', pm.value,
              'metricName', am."metricName",
              'metricType', am."metricType",
              'unit', am.unit
            )
          ) as "metrics"
        FROM "ProgressEntry" pe
        LEFT JOIN "ProgressMetric" pm ON pm."entryId" = pe.id
        LEFT JOIN "ActivityMetric" am ON pm."metricId" = am.id
        WHERE pe."activityId" = $1
        GROUP BY pe.id, pe."entryDate", pe.notes
        ORDER BY pe."entryDate" DESC
        LIMIT 10
      `, [id]),

      pg.query(`
        SELECT
          g."targetValue",
          g."targetPeriod",
          g."startDate",
          g."endDate",
          g."isActive",
          am."metricName",
          am.unit,
          (
            SELECT COALESCE(SUM(pm.value), 0)
            FROM "ProgressMetric" pm
            JOIN "ProgressEntry" pe ON pm."entryId" = pe.id
            WHERE pm."metricId" = g."metricId"
            AND pe."activityId" = $1
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
            AND pe."activityId" = $1
            AND pe."entryDate" >= g."startDate"
            AND pe."entryDate" <= g."endDate"
          ) as "lastEntryDate"
        FROM "Goal" g
        JOIN "ActivityMetric" am on g."metricId" = am.id
        WHERE g."activityId" = $1
        AND g."isActive" = true
        ORDER BY g."endDate" ASC
      `, [id])
    ]);


    const totalEntries = overviewResult.rows[0].totalEntries
    const firstEntry = overviewResult.rows[0].firstEntry

    if (!firstEntry || totalEntries === 0) {
      return res.send({
        success: true,
        data: {
          overview: overviewResult.rows[0],
          metrics: metricStats.rows,
          timeBased: {
            averagePerWeek: 0,
            thisWeekEntries: parseInt(entryDatesResult.rows[0].count) || 0,
            lastWeekEntries: 0,
            thisMonthEntries: parseInt(comparisonResult.rows[0].count) || 0,
            lastMonthEntries: 0,
            weekOverWeek: 0,
            monthOverMonth: 0
          },
          consistency: {
            currentStreak: 0,
            longestStreak: 0,
            totalDaysLogged: 0,
            engagementRate: 0,
            daysSinceFirst: 0
          },
          recentEntries: [],
          goals: goalsResult.rows.map(goal => ({
            ...goal,
            percentageComplete: goal.targetValue > 0
              ? (goal.currentProgress / goal.targetValue * 100)
              : 0
          }))
        }
      })
    }
    const daysSinceFirst = Math.floor((new Date() - new Date(firstEntry)) / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.ceil(daysSinceFirst / 7) || 1
    const averagePerWeek = parseFloat((totalEntries / totalWeeks).toFixed(1))
    const currentStreak = calculateStreak(entryDatesResult.rows)
    const longestStreak = calculateLongestStreak(entryDatesResult.rows)
    const totalDaysLogged = entryDatesResult.rows.length
    const engagementRate = parseFloat(((totalDaysLogged / daysSinceFirst) * 100).toFixed(1))

    const goals = goalsResult.rows.map(goal => ({
      ...goal,
      percentageComplete: goal.targetValue > 0
        ? (goal.currentProgress / goal.targetValue * 100)
        : 0
    }))

    return res.send({
      success: true,
      data: {
        overview: overviewResult.rows[0],
        metrics: metricStats.rows,
        timeBased: {
          averagePerWeek,
          thisWeekEntries: comparisonResult.rows[0].thisWeekEntries,
          lastWeekEntries: comparisonResult.rows[0].lastWeekEntries,
          thisMonthEntries: comparisonResult.rows[0].thisMonthEntries,
          lastMonthEntries: comparisonResult.rows[0].lastMonthEntries,
          weekOverWeek: comparisonResult.rows[0].thisWeekEntries - comparisonResult.rows[0].lastWeekEntries,
          monthOverMonth: comparisonResult.rows[0].thisMonthEntries - comparisonResult.rows[0].lastMonthEntries
        },
        consistency: {
          currentStreak,
          longestStreak,
          totalDaysLogged,
          engagementRate,
          daysSinceFirst
        },
        recentEntries: recentActivityResult.rows,
        goals: goals
      }
    })

  } catch (error) {
    Logger.error("Error fetching activity statistics", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function createActivity(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { activity } = req.body

    if (!(activity?.name && activity?.categoryId)) {
      throw new Error("Activity requires a name and a category")
    }

    const originalCategory = await getGenericById("Category", activity.categoryId)

    if (activity?.groupId && (activity.groupId !== originalCategory.groupId)) {
      throw new Error("Category and activity group id must match")
    }

    const newActivity = {
      ...activity,
      userId: activity?.groupId ? null : user.id,
      groupId: activity?.groupId ? activity.groupId : null,
      updatedAt: new Date()
    }

    const created = await CreateAndLog("Activity", newActivity)

    if (created?.error) {
      throw new Error(created.error)
    }

    return res.send({ success: true, created })
  } catch (error) {
    Logger.error("Error creating activity", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function updateActivity(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { activity } = req.body

    const original = await getGenericById("Activity", activity.id)

    if (!original) {
      throw new Error("Original activity not found")
    }

    if (original?.userId && (original.userId !== user.id)) {
      throw new Error("Only the user who owns the activity can edit it")
    }

    if (original?.groupId) {
      const role = await getUserGroupRole(user, original.groupId)
      if (role.error) {
        throw new Error(role.error)
      }
      if (!(role === 'ADMIN')) {
        throw new Error("Only an admin can edit the activity")
      }
    }

    const newActivity = {
      ...original,
      name: activity?.name ? activity.name : original.name,
      description: activity?.description ? activity.description : original?.description,
      isActive: activity?.isActive ? activity.isActive : original.isActive,
      categoryId: activity?.categoryId ? activity.categoryId : original.categoryId,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("Activity", original.id, newActivity)

    if (updated?.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })
  } catch (error) {
    Logger.error("Unable to update activity", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function deleteActivity(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { id } = req.body

    const original = await getGenericById("Activity", id)

    if (!original) {
      throw new Error("Original activity not found")
    }

    if (original?.userId && (original.userId !== user.id)) {
      throw new Error("Only the user who owns the activity can edit it")
    }

    if (original?.groupId) {
      const role = await getUserGroupRole(user, original.groupId)
      if (role.error) {
        throw new Error(role.error)
      }
      if (!(role === 'ADMIN')) {
        throw new Error("Only an admin can edit the activity")
      }
    }

    const deleted = await DeleteAndLog("Activity", id)

    if (deleted?.error) {
      throw new Error(deleted.error)
    }

    return res.send({ success: true })
  } catch (error) {
    Logger.error("Unable to delete activity", { error })
    return res.send({ success: false, error: error })
  }
}

export async function toggleActivity(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { id } = req.body

    const original = await getGenericById("Activity", id)

    if (!original) {
      throw new Error("Original activity not found")
    }

    if (original?.userId && (original.userId !== user.id)) {
      throw new Error("Only the user who owns the activity can edit it")
    }

    if (original?.groupId) {
      const role = await getUserGroupRole(user, original.groupId)
      if (role.error) {
        throw new Error(role.error)
      }
      if (!(role === 'ADMIN')) {
        throw new Error("Only an admin can edit the activity")
      }
    }

    const newStatus = !original.isActive

    const newActivity = {
      ...original,
      isActive: newStatus,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("Activity", id, newActivity)

    if (updated?.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })
  } catch (error) {
    Logger.error("Unable to toggle activity status", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}
