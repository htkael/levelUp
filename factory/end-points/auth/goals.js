import { CreateAndLog, DeleteAndLog, getGenericById, getUserGroupRole, UpdateAndLog } from "../../shared/dbFuncs.js"
import pg from "../../pg-cli.js"
import { Logger } from "../../shared/logger.js"
import { calculateEndDate, getCurrentDateInTimezone } from "../../shared/timezone.js"
import { TARGET_PERIODS } from "../../constants/constants.js"

export async function listGoals(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }

    const timezone = res.locals.userTimezone

    const today = getCurrentDateInTimezone(timezone)

    const { activityId, isActive, groupId } = req.body

    let query = `
      SELECT
        g.*,
        a.name as "activityName",
        c.name as "categoryName",
        am."metricName" as "metricName",
        am."metricType" as "metricType",
        am.unit as "unit",
          (
            SELECT COALESCE(SUM(pm.value), 0)
            FROM "ProgressMetric" pm
            JOIN "ProgressEntry" pe ON pm."entryId" = pe.id
            WHERE pm."metricId" = g."metricId"
            AND pe."activityId" = g."activityId"
            AND pe."entryDate" >= g."startDate"
            AND pe."entryDate" <= LEAST(g."endDate", $2::date)
          ) as "currentProgress",
          EXTRACT(DAYS FROM AGE($2::date, g."startDate")) as "daysElapsed",
          GREATEST(0, EXTRACT(DAYS FROM AGE(g."endDate", $2::date))) as "daysRemaining",
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
      WHERE (g."userId" = $1 OR g."groupId" IN (
        SELECT "groupId" FROM "UserGroup" WHERE "userId" = $1
      ))
    `

    const vals = [user.id, today]
    let paramCount = 2

    if (activityId) {
      paramCount++
      query += ` AND g."activityId" = $${paramCount}`
      vals.push(activityId)
    }

    if (groupId) {
      paramCount++
      query += ` AND g."groupId" = $${paramCount}`
      vals.push(groupId)
    }

    if (isActive === true) {
      paramCount++
      query += ` AND g."isActive" = $${paramCount}`
      vals.push(isActive)
    }

    query += ` ORDER BY g."groupId" NULLS FIRST, g."endDate" ASC`

    const goals = (await pg.query(query, vals)).rows.map(goal => ({
      ...goal,
      percentageComplete: goal.targetValue > 0
        ? (Math.min(goal.currentProgress / goal.targetValue * 100, 100))
        : 0
    }))

    return res.send({ success: true, goals })

  } catch (error) {
    Logger.error("Unable to list goals", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function getGoal(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }

    const timezone = res.locals.userTimezone

    const today = getCurrentDateInTimezone(timezone)

    const { id } = req.body

    if (!id) {
      throw new Error("Goal id required")
    }

    let query = `
      SELECT
        g.*,
        a.name as "activityName",
        c.name as "categoryName",
        am."metricName" as "metricName",
        am."metricType" as "metricType",
        am.unit as "unit",
          (
            SELECT COALESCE(SUM(pm.value), 0)
            FROM "ProgressMetric" pm
            JOIN "ProgressEntry" pe ON pm."entryId" = pe.id
            WHERE pm."metricId" = g."metricId"
            AND pe."activityId" = g."activityId"
            AND pe."entryDate" >= g."startDate"
            AND pe."entryDate" <= LEAST(g."endDate", $2::date)
          ) as "currentProgress",
          EXTRACT(DAYS FROM AGE($2::date, g."startDate")) as "daysElapsed",
          GREATEST(0, EXTRACT(DAYS FROM AGE(g."endDate", $2::date))) as "daysRemaining",
          EXTRACT(DAYS FROM AGE(g."endDate", g."startDate")) as "totalDays",
          (
            SELECT MAX(pe."entryDate")
            FROM "ProgressMetric" pm
            JOIN "ProgressEntry" pe ON pm."entryId" = pe.id
            WHERE pm."metricId" = g."metricId"
            AND pe."activityId" = g."activityId"
            AND pe."entryDate" >= g."startDate"
            AND pe."entryDate" <= g."endDate"
          ) as "lastEntryDate",
          (
            SELECT COALESCE(JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', pe.id,
                'activityId', pe."activityId",
                'userId', pe."userId",
                'entryDate', pe."entryDate",
                'notes', pe.notes,
                'createdAt', pe."createdAt",
                'updatedAt', pe."updatedAt",
                'value', pm.value,
                'metricName', am."metricName",
                'unit', am.unit
              )
            ), '[]'::json)
            FROM "ProgressMetric" pm
            LEFT JOIN "ProgressEntry" pe ON pm."entryId" = pe.id
            LEFT JOIN "ActivityMetric" am ON pm."metricId" = am.id
            WHERE pm."metricId" = g."metricId"
            AND pe."activityId" = g."activityId"
            AND pe."entryDate" >= g."startDate"
            AND pe."entryDate" <= LEAST(g."endDate", $2::date)
          ) as "allEntries"
      FROM "Goal" g
      LEFT JOIN "Activity" a ON g."activityId" = a.id
      LEFT JOIN "Category" c ON a."categoryId" = c.id
      LEFT JOIN "ActivityMetric" am ON g."metricId" = am.id
      WHERE g.id = $1
    `
    let g = (await pg.query(query, [id, today])).rows

    if (g?.length !== 1) {
      throw new Error("Goal not found")
    }

    const goalData = g[0]

    if (goalData?.groupId) {
      const role = await getUserGroupRole(user, goalData.groupId)
      if (role?.error) {
        throw new Error("user does not belong to group")
      }
      if (!role) {
        throw new Error("user does not belong to group")
      }
    } else if (goalData?.userId) {
      if (user.id !== goalData.userId) {
        throw new Error("Only user owner can view goal")
      }
    }

    let goal = {
      ...goalData,
      percentageComplete: goalData.targetValue > 0
        ? (Math.min(goalData.currentProgress / goalData.targetValue * 100, 100))
        : 0
    }

    return res.send({ success: true, goal })

  } catch (error) {
    Logger.error("Unable to fetch goal", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}


export async function createGoal(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }

    const { goal } = req.body

    if (goal?.groupId) {
      const userRole = await getUserGroupRole(user, goal.groupId)
      if (userRole.error) {
        throw new Error(userRole.error)
      }
      if (userRole !== "ADMIN") {
        throw new Error("Only admins can create group goals")
      }
    }


    if (!(goal.targetValue && goal.targetPeriod && goal.startDate && goal.activityId && goal.metricId)) {
      throw new Error("Goal requires targetValue, targetPeriod, startDate, activityId, and metricId")
    }


    const validPeriods = Object.values(TARGET_PERIODS)
    if (!validPeriods.includes(goal.targetPeriod)) {
      throw new Error("Invalid target period")
    }

    if ((goal.targetPeriod === TARGET_PERIODS.TOTAL && !goal?.endDate)) {
      throw new Error("Non recurring goals must send an end date with request")
    }

    let endDateToAdd

    if (goal?.endDate && goal.targetPeriod === TARGET_PERIODS.TOTAL) {
      endDateToAdd = goal.endDate
    } else {
      endDateToAdd = calculateEndDate(goal.startDate, goal?.targetPeriod)
    }

    const start = new Date(goal.startDate)
    const end = new Date(endDateToAdd)

    if (end < start) {
      throw new Error("End date must be after start date")
    }

    const originalMetric = await getGenericById("ActivityMetric", goal.metricId)
    Logger.debug("originalMetric", originalMetric)

    if (!originalMetric) {
      throw new Error(`metric with id: ${goal.metricId} not found`)
    }

    if (originalMetric.activityId !== goal.activityId) {
      throw new Error("Provided metric does not reference the selected activity")
    }

    const newGoal = {
      ...goal,
      endDate: endDateToAdd,
      userId: goal?.groupId ? null : user.id,
      groupId: goal?.groupId ? goal.groupId : null,
      updatedAt: new Date()
    }

    const created = await CreateAndLog("Goal", newGoal)

    if (created?.error) {
      throw new Error(created.error)
    }

    return res.send({ success: true, created })

  } catch (error) {
    Logger.error("Unable to create goal", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function updateGoal(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }

    const { goal } = req.body

    if (!goal.id) {
      throw new Error("Goal needs an id to update")
    }

    const originalGoal = await getGenericById("Goal", goal.id)

    if (!originalGoal?.id) {
      throw new Error(`goal with id: ${goal.id} not found`)
    }

    if (originalGoal?.groupId) {
      const userRole = await getUserGroupRole(user, originalGoal.groupId)
      if (userRole?.error) {
        throw new Error(userRole.error)
      }
      if (userRole !== "ADMIN") {
        throw new Error("Only admins can edit group goals")
      }
    } else if (originalGoal?.userId) {
      if (user.id !== originalGoal.userId) {
        throw new Error("goal can only be updated by the owner user")
      }
    }

    if (!(goal.targetValue && goal.targetPeriod && goal.startDate && goal.activityId && goal.metricId)) {
      throw new Error("Goal requires targetValue, targetPeriod, startDate, activityId, and metricId")
    }


    const validPeriods = Object.values(TARGET_PERIODS)
    if (!validPeriods.includes(goal.targetPeriod)) {
      throw new Error("Invalid target period")
    }

    if ((goal.targetPeriod === TARGET_PERIODS.TOTAL && !goal?.endDate)) {
      throw new Error("Non recurring goals must send an end date with request")
    }

    let endDateToAdd

    if (goal?.endDate && goal.targetPeriod === TARGET_PERIODS.TOTAL) {
      endDateToAdd = goal.endDate
    } else {
      endDateToAdd = calculateEndDate(goal.startDate, goal?.targetPeriod)
      Logger.debug("date calculated", { endDateToAdd })
    }

    const start = new Date(goal.startDate)
    const end = new Date(endDateToAdd)

    if (end < start) {
      throw new Error("End date must be after start date")
    }

    const originalMetric = await getGenericById("ActivityMetric", goal.metricId)

    if (!originalMetric) {
      throw new Error(`metric with id: ${goal.metricId} not found`)
    }

    if (originalMetric.activityId !== goal.activityId) {
      throw new Error("Provided metric does not reference the selected activity")
    }


    const newGoal = {
      ...goal,
      endDate: endDateToAdd,
      userId: goal?.groupId ? null : user.id,
      groupId: goal?.groupId ? goal.groupId : null,
      updatedAt: new Date()
    }

    Logger.debug("originalGoal", originalGoal)
    Logger.debug("newgoal", newGoal)

    const updated = await UpdateAndLog("Goal", originalGoal.id, newGoal)
    Logger.debug("updated", updated)

    if (updated?.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })

  } catch (error) {
    Logger.error("Unable to update goal", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function deleteGoal(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }

    const { id } = req.body

    const originalGoal = await getGenericById("Goal", id)

    if (!originalGoal) {
      throw new Error(`goal with id: ${id} not found`)
    }

    if (originalGoal?.groupId) {
      const userRole = await getUserGroupRole(user, originalGoal.groupId)
      if (userRole?.error) {
        throw new Error(userRole.error)
      }
      if (userRole !== "ADMIN") {
        throw new Error("Only admins can delete group goals")
      }
    } else if (originalGoal?.userId) {
      if (user.id !== originalGoal.userId) {
        throw new Error("goal can only be deleted by the owner user")
      }
    }

    const deleted = await DeleteAndLog("Goal", id)

    if (deleted?.error) {
      throw new Error(deleted.error)
    }

    return res.send({ success: true })

  } catch (error) {
    Logger.error("Unable to delete goal", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function toggleGoal(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { id } = req.body

    const original = await getGenericById("Goal", id)

    if (!original) {
      throw new Error("Original goal not found")
    }

    if (original?.userId && (original.userId !== user.id)) {
      throw new Error("Only the user who owns the goal can edit it")
    }

    if (original?.groupId) {
      const role = await getUserGroupRole(user, original.groupId)
      if (role.error) {
        throw new Error(role.error)
      }
      if (!(role === 'ADMIN')) {
        throw new Error("Only an admin can edit the goal")
      }
    }

    const newStatus = !original.isActive

    const newGoal = {
      ...original,
      isActive: newStatus,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("Goal", id, newGoal)

    if (updated?.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })
  } catch (error) {
    Logger.error("Unable to toggle goal status", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}
