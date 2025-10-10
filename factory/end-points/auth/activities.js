import { CreateAndLog, UpdateAndLog, DeleteAndLog, getGenericById, getUserGroupRole } from "../../shared/dbFuncs.js";
import pg from "../../pg-cli.js";

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
