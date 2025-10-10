import { CreateAndLog, UpdateAndLog, DeleteAndLog, getGenericById } from "../../../shared/dbFuncs.js";

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

    if (!(activity?.groupId && activity?.userId)) {
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

    if (!activity?.name) {
      throw new Error("Activity name required")
    }

    if (!(activity?.groupId && activity?.userId)) {
      throw new Error("A group id or user id is required to create a activity")
    }

    if (activity?.userId && activity?.groupId) {
      throw new Error("A activity can only belong to a group OR a user")
    }

    const original = await getGenericById("Activity", activity.id)

    if (!original) {
      throw new Error("Original activity not found")
    }

    const newActivity = {
      ...activity,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("Activity", original.id, newActivity)

    if (updated.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })
  } catch (error) {
    Logger.error("Unable to update categoiry", { error: error.message })
    return res.send({ success: false, error: error })
  }
}

export async function deleteActivity(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { id } = req.body

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
