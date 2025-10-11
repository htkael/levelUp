import { CreateAndLog, UpdateAndLog, DeleteAndLog, getGenericById, getUserGroupRole } from "../../shared/dbFuncs.js";
import pg from "../../pg-cli.js";
import { Logger } from "../../shared/logger.js";

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

    let filterClause = `WHERE ${searchField} = $1 `

    if (isActive) {
      filterClause += `AND "isActive" = $2 `
      searchValue.push(isActive)
    }

    if (categoryId) {
      filterClause += `AND "categoryId" = $3`
    }

    const activities = (await pg.query(`
      SELECT * FROM "Activity"
      ${filterClause}
    `, [searchValue])).rows

    return res.send({ success: true, activities })
  } catch (error) {
    Logger.error("Error listing categories", { error: error.message })
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

    const [overviewResult, metricStats, weeklyEntries, monthlyEntries, entryDatesResult, comparisonResult, recentActivityResult, goalsResult] = await Promise.all([
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
        SELECT DISTINCT "entryDate"::date as "entry_date"
        FROM "ProgressEntry"
        WHERE "activityId" = $1
        ORDER BY "entry_date" DESC
      `, [id]),

      pg.query(`
        SELECT
          COUNT(*) FILTER (WHERE "entryDate" >= DATE_TRUNC('week', CURRENT_DATE)) as "thisWeekEntries",
          COUNT(*) FILTER (WHERE "entryDate" < DATE_TRUNC('week', CURRENT_DATE) AND "entryDate" >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days') as "lastWeekEntries",
          COUNT(*) FILTER (WHERE "entryDate" >= DATE_TRUNC('month', CURRENT_DATE)) as "thisMonthEntries",
          COUNT(*) FILTER (WHERE "entryDate" < DATE_TRUNC('month', CURRENT_DATE) AND "entryDate" >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month') as "lastMonthEntries"
        FROM "ProgressEntry"
        WHERE "activityId" = $1
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
          ) as 'metrics'
        FROM "ProgressEntry" pe
        LEFT JOIN "ProgressMetric" pm ON pm."entryId" = pe.id
        LEFT JOIN "ActivityMetric" am ON pm."metricId" = am.id
        WHERE pe."activityId" = $1
        GROUP BY pe.id, pe."entryDate", pe.notes
        ORDER BY pe."entryDate" DESC
        LIMIT 10
      `, [id])
    ]);
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

    if (!(activity?.groupId || activity?.userId)) {
      throw new Error("A group id or user id is required to create a activity")
    }

    if (activity?.userId && activity?.groupId) {
      throw new Error("A activity can only belong to a group OR a user")
    }

    const newActivity = {
      ...activity,
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
      if (!(role === 'ADMIN')) {
        throw new Error("Only an admin can edit the activity")
      }
    }

    const newActivity = {
      ...original,
      name: activity?.name ? activity.name : original.name,
      description: activity?.description ? activity.description : original?.description,
      isActive: category?.isActive ? category.isActive : original.isActive,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("Activity", original.id, newActivity)

    if (updated.error) {
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
      if (!(role === 'ADMIN')) {
        throw new Error("Only an admin can edit the activity")
      }
    }

    const deleted = await DeleteAndLog("Activity", id)

    if (deleted.error) {
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
      if (!(role === 'ADMIN')) {
        throw new Error("Only an admin can edit the activity")
      }
    }

    const newStatus = !original.status

    const newActivity = {
      ...original,
      isActive: newStatus,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("Activity", id, newActivity)

    if (updated.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })
  } catch (error) {
    Logger.error("Unable to toggle activity status", { error })
    return res.send({ success: false, error: error.message })
  }
}
