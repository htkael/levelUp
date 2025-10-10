import { CreateAndLog, UpdateAndLog, DeleteAndLog, getGenericById } from "../../../shared/dbFuncs.js";
import pg from "../../../pg-cli.js";
import format from "pg-format";

export async function createProgressEntry(req, res) {
  const client = await pg.connect()

  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { progressEntry } = req.body

    if (!(progressEntry?.entryDate && progressEntry?.activityId)) {
      throw new Error("Progress entry requires an entry date and an activity")
    }

    await client.query("BEGIN")


    const newProgressEntry = {
      ...progressEntry,
      userId: user.id,
      updatedAt: new Date()
    }

    const created = await CreateAndLog("ProgressEntry", newProgressEntry, true, client)

    if (created?.error) {
      throw new Error(created.error)
    }

    const metrics = progressEntry?.metrics

    if (metrics && metrics.length > 0) {
      metrics.forEach(metric => {
        if (!(metric?.metricId && metric?.value !== null)) {
          throw new Error("Metrics must have both a value and metric type")
        }
      });

      const metricValues = metrics.map((m) => {
        return [m.value, m.metricId, created.id]
      })

      const metricQuery = format(
        `INSERT INTO "ProgressMetric" (value, "metricId", "entryId") VALUES %L RETURNING *`,
        metricValues
      )

      const createdMetrics = (await client.query(metricQuery)).rows

      await client.query("COMMIT")
      return res.send({ success: true, created, createdMetrics })
    } else {
      await client.query("COMMIT")
      return res.send({ success: true, created })
    }

  } catch (error) {
    await client.query("ROLLBACK")
    Logger.error("Error creating progressEntry", { error: error.message })
    return res.send({ success: false, error: error.message })
  } finally {
    client.release()
  }
}

export async function updateProgressEntry(req, res) {
  const client = await pg.connect()

  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { progressEntry } = req.body

    if (!(progressEntry?.entryDate && progressEntry?.activityId)) {
      throw new Error("Progress entry requires an entry date and an activity")
    }

    await client.query("BEGIN")

    const original = await getGenericById("ProgressEntry", progressEntry.id, client)

    if (!original) {
      throw new Error("Original entry not found")
    }


    const newProgressEntry = {
      ...progressEntry,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("ProgressEntry", newProgressEntry, true, client)

    if (updated?.error) {
      throw new Error(updated.error)
    }

    const metrics = progressEntry?.metrics

    if (metrics && metrics.length > 0) {
      metrics.forEach(metric => {
        if (!(metric?.metricId && metric?.value !== null)) {
          throw new Error("Metrics must have both a value and metric type")
        }
      });

      const metricValues = metrics.map((m) => {
        return [m.value, m.metricId, updated.id]
      })

      const metricQuery = format(
        `INSERT INTO "ProgressMetric" (value, "metricId", "entryId")
         VALUES %L
         ON CONFLICT ("entryId", "metricId")
         DO UPDATE SET
         value = EXCLUDED.value
         RETURNING *`,
        metricValues
      )

      const updatedMetrics = (await client.query(metricQuery)).rows

      await client.query("COMMIT")
      return res.send({ success: true, updated, updatedMetrics })
    } else {
      await client.query("COMMIT")
      return res.send({ success: true, updated })
    }

  } catch (error) {
    await client.query("ROLLBACK")
    Logger.error("Error updating progressEntry", { error: error.message })
    return res.send({ success: false, error: error.message })
  } finally {
    client.release()
  }
}

export async function deleteProgressEntry(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { id } = req.body

    const deleted = await DeleteAndLog("ProgressMetric", id)

    if (deleted.error) {
      throw new Error(deleted.error)
    }

    return res.send({ success: true })
  } catch (error) {
    Logger.error("Unable to delete progress metric", { error })
    return res.send({ success: false, error: error })
  }
}
