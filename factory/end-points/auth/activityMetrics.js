import { CreateAndLog, UpdateAndLog, DeleteAndLog, getGenericById } from "../../shared/dbFuncs.js";
import pg from "../../pg-cli.js";
import { METRIC_TYPES } from "../../constants/constants.js";
import { Logger } from "../../shared/logger.js";

export async function createActivityMetric(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { activityMetric } = req.body

    if (!(activityMetric?.metricName && activityMetric?.metricType && activityMetric?.activityId)) {
      throw new Error("Activity metric requires a name, an activity, and a metric type")
    }

    const validTypes = Object.values(METRIC_TYPES)
    if (!validTypes.includes(activityMetric.metricType)) {
      throw new Error("Invalid metric type")
    }

    if (activityMetric?.isPrimary) {
      await pg.query(`
        UPDATE "ActivityMetric"
        SET "isPrimary" = false
        WHERE "isPrimary" = true
        AND "activityId" = $1
      `, [activityMetric.activityId])
    }



    const newActivityMetric = {
      ...activityMetric,
      updatedAt: new Date()
    }

    const created = await CreateAndLog("ActivityMetric", newActivityMetric)

    if (created?.error) {
      throw new Error(created.error)
    }

    return res.send({ success: true, created })
  } catch (error) {
    Logger.error("Error creating activityMetric", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function updateActivityMetric(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { activityMetric } = req.body

    if (!(activityMetric?.metricName && activityMetric?.metricType && activityMetric?.activityId)) {
      throw new Error("Activity metric requires a name, an activity, and a metric type")
    }

    if (activityMetric?.isPrimary) {
      await pg.query(`
        UPDATE "ActivityMetric"
        SET "isPrimary" = false
        WHERE "isPrimary" = true
        AND "activityId" = $1
      `, [activityMetric.activityId])
    }

    const original = await getGenericById("ActivityMetric", activityMetric.id)

    if (!original) {
      throw new Error("Original activityMetric not found")
    }

    const newActivityMetric = {
      ...original,
      metricName: activityMetric.metricName,
      metricType: activityMetric.metricType,
      unit: activityMetric?.unit ? activityMetric.unit : original?.unit,
      isPrimary: activityMetric?.isPrimary,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("ActivityMetric", original.id, newActivityMetric)

    if (updated?.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })
  } catch (error) {
    Logger.error("Unable to update metric", { error: error.message })
    return res.send({ success: false, error: error })
  }
}

export async function deleteActivityMetric(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { id } = req.body

    const deleted = await DeleteAndLog("ActivityMetric", id)

    if (deleted?.error) {
      throw new Error(deleted.error)
    }

    return res.send({ success: true })
  } catch (error) {
    Logger.error("Unable to delete activityMetric", { error })
    return res.send({ success: false, error: error.message })
  }
}

export async function makePrimaryMetric(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { id } = req.body

    if (!id) {
      throw new Error("Metric id required")
    }

    const original = await getGenericById("ActivityMetric", id)

    if (!original) {
      throw new Error("Original metric not found")
    }

    await pg.query(`
      UPDATE "ActivityMetric"
      SET "isPrimary" = false
      WHERE "isPrimary" = true
      AND "activityId" = $1
    `, [original.activityId])

    await pg.query(`
      UPDATE "ActivityMetric"
      SET "isPrimary" = true
      WHERE id = $1
    `, [id])

    return res.send({ success: true })

  } catch (error) {
    Logger.error("Unable to set as primary metric", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function listActivityMetrics(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { activityId } = req.body

    if (!activityId) {
      throw new Error("Activity Id required to list metrics")
    }

    const metrics = (await pg.query(`
      SELECT id, "metricName", "metricType", unit
      FROM "ActivityMetric"
      WHERE "activityId" = $1
    `, [activityId])).rows

    return res.send({ success: true, metrics })


  } catch (error) {
    Logger.error("Error fetching activity metrics", { error: error.message || "Unknown error" })
    return res.send({ success: false, error: error.message })
  }
}
