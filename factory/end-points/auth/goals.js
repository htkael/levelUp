import { CreateAndLog, DeleteAndLog, getGenericById, getUserGroupRole, UpdateAndLog } from "../../shared/dbFuncs"
import { Logger } from "../../shared/logger"

export async function listGoals(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }

    const { activityId, isActive, groupId } = req.body

    let query = `
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
          EXTRACT(DAYS FROM AGE(g."endDate", g."startDate)) as "totalDays",
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

    const vals = [user.id]
    let paramCount = 1

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

    if (isActive !== undefined) {
      paramCount++
      query += ` AND g."isActive" = $${paramCount}`
      vals.push(isActive)
    }

    query += ` ORDER BY g."groupId" NULLS FIRST, g."endDate" ASC`

    const goals = (await pg.query(query, vals)).rows.map(goal => ({
      ...goal,
      percentageComplete: goal.targetValue > 0
        ? (goal.currentProgress / goal.targetValue * 100)
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
          EXTRACT(DAYS FROM AGE(g."endDate", g."startDate)) as "totalDays",
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
      WHERE g.id = $1
    `
    let g = (await pg.query(query, [id])).rows

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
        ? (goalData.currentProgress / goalData.targetValue * 100)
        : 0
    }

    return res.send({ success: true, goal })

  } catch (error) {
    Logger.error("Unable to fetch goal", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

//model Goal {
//  id           Int            @id @default(autoincrement())
//  createdAt    DateTime       @default(now())
//  updatedAt    DateTime       @updatedAt
//  targetValue  Decimal        @db.Decimal(10, 2)
//  targetPeriod TargetPeriod
//  startDate    DateTime       @db.Date
//  endDate      DateTime       @db.Date
//  isActive     Boolean        @default(true)
//  user         User?          @relation(fields: [userId], references: [id], onDelete: Cascade)
//  userId       Int?
//  group        Group?         @relation(fields: [groupId], references: [id], onDelete: Cascade)
//  groupId      Int?
//  activity     Activity       @relation(fields: [activityId], references: [id], onDelete: Cascade)
//  activityId   Int
//  metric       ActivityMetric @relation(fields: [metricId], references: [id], onDelete: Cascade)
//  metricId     Int
//}


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


    if (!(goal.targetValue && goal.targetPeriod && goal.startDate && goal.endDate && goal.activityId && goal.metricId)) {
      throw new Error("Goal requires targetValue, targetPeriod, startDate, endDate, activityId, and metricId")
    }

    const start = new Date(goal.startDate)
    const end = new Date(goal.endDate)

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

    const originalGoal = await getGenericById("Goal", goal.id)

    if (!originalGoal) {
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

    if (!(goal.id && goal.targetValue && goal.targetPeriod && goal.startDate && goal.endDate && goal.activityId && goal.metricId)) {
      throw new Error("Updated goal requires id, targetValue, targetPeriod, startDate, endDate, activityId, and metricId")
    }

    const start = new Date(goal.startDate)
    const end = new Date(goal.endDate)

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
      userId: originalGoal.userId,
      goalId: originalGoal.goalId,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("Goal", originalGoal.id, newGoal)

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

    if (updated.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })
  } catch (error) {
    Logger.error("Unable to toggle goal status", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}
