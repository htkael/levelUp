import { CreateAndLog, UpdateAndLog, DeleteAndLog, getGenericById } from "../../shared/dbFuncs.js";
import pg from "../../pg-cli.js";
import format from "pg-format";
import { Logger } from "../../shared/logger.js";

export async function getProgressEntry(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }

    const { entryId } = req.body

    if (!entryId) {
      throw new Error("id required")
    }

    let entry = await getGenericById("ProgressEntry", entryId)

    if (!entry) {
      throw new Error("Entry not found")
    }

    const metrics = (await pg.query(`
      SELECT
        a."metricName" as "metricName",
        a."metricType" as "metricType",
        pm."value" as "value",
        a."unit" as "unit",
        FROM "ProgressMetric" pm
        LEFT JOIN "ActivityMetric" a ON pm."metricId" = a.id
        WHERE pm."entryId" = $1
    `, [entry.id])).rows

    entry.metrics = metrics

    return res.send({ success: true, entry })

  } catch (error) {
    Logger.error("Unable to get progress entry", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function listProgressEntries(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }

    const { userId, activityId, startDate, endDate, limit = 20, offset = 0 } = req.body

    let query = `
      SELECT
        pe.*,
        a.name as "activityName",
        c.name as "categoryName"
      FROM "ProgressEntry" pe
      JOIN "Activity" a ON pe."activityId" = a.id
      JOIN "Category" c ON a."categoryId" = c.id
      WHERE pe."userId" = $1
    `

    const vals = [userId]
    let paramCount = 1

    if (activityId) {
      paramCount++
      query += ` AND pe."activityId" = $${paramCount}`
      vals.push(activityId)
    }

    if (startDate) {
      paramCount++
      query += ` AND pe."entryDate" >= $${paramCount}`
      vals.push(startDate)
    }

    if (endDate) {
      paramCount++
      query += ` AND pe."entryDate" <= $${paramCount}`
      vals.push(endDate)
    }

    query += ` ORDER BY pe."entryDate" DESC`

    paramCount++
    query += ` LIMIT $${paramCount}`
    vals.push(limit)

    paramCount++
    query += ` OFFSET $${paramCount}`
    vals.push(offset)

    const result = await pg.query(query, vals)

    return res.send({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    })

  } catch (error) {
    Logger.error("Unable to list progress entries", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function listProgressEntryCalendar(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }
    const { activityId, month } = req.body  // month format: "2025-10"

    let query = `
      SELECT
        pe.*,
        a.name as "activityName",
        c.name as "categoryName"
      FROM "ProgressEntry" pe
      JOIN "Activity" a ON pe."activityId" = a.id
      JOIN "Category" c ON a."categoryId" = c.id
      WHERE pe."userId" = $1
    `

    const vals = [user.id]
    let paramCount = 1

    if (activityId) {
      paramCount++
      query += ` AND pe."activityId" = $${paramCount}`
      vals.push(activityId)
    }

    if (month) {
      paramCount++
      query += ` AND DATE_TRUNC('month', pe."entryDate") = DATE_TRUNC('month', $${paramCount}::date)`
      vals.push(`${month}-01`)
    }

    query += ` ORDER BY pe."entryDate" DESC`

    const result = await pg.query(query, vals)

    const grouped = result.rows.reduce((acc, entry) => {
      const dateKey = entry.entryDate.toISOString().split('T')[0]  // "2025-10-12"
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(entry)
      return acc
    }, {})

    return res.send({
      success: true,
      data: grouped
    })

  } catch (error) {
    Logger.error("Unable to list calendar entries", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

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

    const updated = await UpdateAndLog("ProgressEntry", original.id, newProgressEntry, true, client)

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

    const deleted = await DeleteAndLog("ProgressEntry", id)

    if (deleted.error) {
      throw new Error(deleted.error)
    }

    return res.send({ success: true })
  } catch (error) {
    Logger.error("Unable to delete progress metric", { error })
    return res.send({ success: false, error: error })
  }
}
