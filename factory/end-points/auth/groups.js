import { Logger } from "../../shared/logger"
import pg from "../../pg-cli"
import { getUserGroupRole } from "../../shared/dbFuncs"

export async function listGroups(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const groups = (await pg.query(`
      SELECT
        g.*,
        ug.role as "role"
      FROM "UserGroup" ug
      JOIN "Group" g ON ug."groupId" = g.id
      WHERE ug."userId" = $1
    `, [user.id])).rows

    return res.send({ success: true, groups })
  } catch (error) {
    Logger.error("Error listing groups", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function getGroup(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { id } = req.body

    const role = await getUserGroupRole(user, id)
    if (role.error) {
      throw new Error(role.error)
    }
    if (!role) {
      throw new Error("User does not belong to group and cant get details")
    }

    const g = (await pg.query(`
      SELECT
        g.*,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'username', u.username,
            'email', u.email,
            'firstName', u."firstName",
            'lastName', u."lastName",
            'role', ug.role
          )
        ) as "users"
      FROM "Group" g
      LEFT JOIN "UserGroup" ug ON ug."groupId" = g.id
      LEFT JOIN "User" u ON ug."userId" = u.id
      WHERE g.id = $1
      GROUP BY g.*
    `, [id])).rows

    if (g.length === 0) {
      throw new Error("Group not found")
    }

    const group = g[0]

    return res.send({ success: true, group })
  } catch (error) {
    Logger.error("Error getting group", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}
