import pg from "../../../pg-cli.js";
import { getUserGroupRole } from "../../../shared/dbFuncs.js";
import { Logger } from "../../../shared/logger.js";


export async function getGroupLeaderboard(req, res) {
  try {
    const user = res?.locals?.user
    const { groupId, activityId, metricId, period } = req.body

    if (!groupId) {
      throw new Error("Group id required")
    }

    const role = await getUserGroupRole(user, groupId)
    if (role?.error) {
      throw new Error(role.error)
    }
    if (!role) {
      throw new Error("User does not belong to group")
    }

    const periodOptions = ['week', 'month', 'all']
    if (period && !periodOptions.includes(period)) {
      throw new Error("Invalid period")
    }

    let selectClause = `
      SELECT
        u.id,
        u.username
    `

    let fromClause = `
      FROM "ProgressEntry" pe
      JOIN "User" u ON pe."userId" = u.id
      JOIN "UserGroup" ug ON ug."userId" = u.id
      JOIN "Activity" a ON a.id = pe."activityId"
    `

    let whereClause = `
      WHERE ug."groupId" = $1
      AND a."groupId" = $1
    `

    const vals = [groupId]
    let paramCount = 1

    if (metricId) {
      selectClause += `,
        COALESCE(SUM(pm.value), 0) as score`
      fromClause += `
      LEFT JOIN "ProgressMetric" pm ON pm."entryId" = pe.id`

      paramCount++
      whereClause += `
      AND pm."metricId" = $${paramCount}`
      vals.push(metricId)
    } else {
      selectClause += `,
        COUNT(pe.id) as score`
    }

    if (activityId) {
      paramCount++
      whereClause += `
      AND a.id = $${paramCount}`
      vals.push(activityId)
    }

    if (period && period !== 'all') {
      const periodMap = {
        week: "DATE_TRUNC('week', CURRENT_DATE)",
        month: "DATE_TRUNC('month', CURRENT_DATE)"
      }
      whereClause += `
      AND pe."entryDate" >= ${periodMap[period]}`
    }

    const groupByClause = `
      GROUP BY u.id, u.username
    `

    const orderByClause = `
      ORDER BY score DESC
      LIMIT 10
    `

    const query = selectClause + fromClause + whereClause + groupByClause + orderByClause

    const leaderboardResult = await pg.query(query, vals)
    const leaderboard = leaderboardResult.rows

    return res.send({
      success: true,
      leaderboard
    })

  } catch (error) {
    Logger.error("Group leaderboard query error", { error: error?.message || error })
    return res.status(500).send({ success: false, error: "Failed to fetch group leaderboard data" })
  }
}
