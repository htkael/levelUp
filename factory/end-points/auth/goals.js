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
        am.unit as "metricUnit"
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

    const goals = (await pg.query(query, vals)).rows

    return res.send({ success: true, goals })

  } catch (error) {
    Logger.error("Unable to list goals", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}
