import { Logger } from "../../shared/logger.js"
import pg from "../../pg-cli.js"
import { CreateAndLog, DeleteAndLog, getGenericById, getUserGroupRole, UpdateAndLog } from "../../shared/dbFuncs.js"

const GROUPTYPES = {
  guild: "GUILD",
  clan: "CLAN",
  family: "FAMILY",
  corporation: "CORPORATION"
}

const GROUPROLES = {
  admin: "ADMIN",
  moderator: "MODERATOR",
  member: "MEMBER"
}

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

export async function createGroup(req, res) {
  const client = await pg.connect()
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { group } = req.body

    if (!group?.name) {
      throw new Error("Group needs a name")
    }

    if (!Object.values(GROUPTYPES).includes(group?.groupType)) {
      throw new Error("Invalid group type")
    }

    const newGroup = {
      name: group.name,
      groupType: group.groupType,
      updatedAt: new Date()
    }

    await client.query("BEGIN")

    const created = await CreateAndLog("Group", newGroup, true, client)

    if (created?.error) {
      throw new Error(created.error)
    }

    const newUserGroupRole = {
      groupId: created.id,
      userId: user.id,
      role: GROUPROLES.admin
    }

    const createdRole = await CreateAndLog("UserGroup", newUserGroupRole, true, client)

    if (createdRole?.error) {
      throw new Error(createdRole.error)
    }

    await client.query("COMMIT")
    return res.send({ success: true, group: created, role: createdRole })

  } catch (error) {
    Logger.error("Error creating group", { error: error.message })
    await client.query("ROLLBACK")
    return res.send({ success: false, error: error.message })
  } finally {
    client.release()
  }
}

export async function updateGroup(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { group } = req.body


    if (!group?.name || !group.id) {
      throw new Error("Group needs a name and id")
    }

    if (!Object.values(GROUPTYPES).includes(group?.groupType)) {
      throw new Error("Invalid group type")
    }

    const original = await getGenericById("Group", group.id)

    if (!original) {
      throw new Error("Original group not found")
    }

    const role = await getUserGroupRole(user, original.id)
    if (role?.error) {
      throw new Error(role.error)
    }
    if (role !== GROUPROLES.admin) {
      throw new Error("Only group admins can update groups")
    }

    const newGroup = {
      name: group.name,
      groupType: group.groupType,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("Group", original.id, newGroup, true)

    if (updated?.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, group: updated })

  } catch (error) {
    Logger.error("Error updating group", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function deleteGroup(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { id } = req.body


    if (!id) {
      throw new Error("Invalid group id")
    }

    const original = await getGenericById("Group", id)

    if (!original) {
      throw new Error("Original group not found")
    }

    const role = await getUserGroupRole(user, original.id)
    if (role?.error) {
      throw new Error(role.error)
    }
    if (role !== GROUPROLES.admin) {
      throw new Error("Only group admins can delete groups")
    }

    const deleted = await DeleteAndLog("Group", id)

    if (deleted?.error) {
      throw new Error(deleted.error)
    }

    return res.send({ success: true })

  } catch (error) {
    Logger.error("Error deleting group", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function addMember(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { invited } = req.body


    if (!invited.userId) {
      throw new Error("Invalid user id")
    }

    if (!Object.values(GROUPROLES).includes(invited?.role)) {
      throw new Error("Invalid role given for new user")
    }

    if (!invited?.groupId) {
      throw new Error("Invalid group id")
    }

    const originalUser = await getGenericById("User", invited.userId)

    if (!originalUser) {
      throw new Error("Original user not found")
    }

    const originalGroup = await getGenericById("Group", invited.groupId)

    if (!originalGroup) {
      throw new Error("Original group not found")
    }

    const role = await getUserGroupRole(user, originalGroup.id)
    if (role?.error) {
      throw new Error(role.error)
    }
    if (role !== GROUPROLES.admin && role !== GROUPROLES.moderator) {
      throw new Error("Only group admins or moderators can add members")
    }

    const originalUserRole = (await pg.query(`
      SELECT id FROM "UserGroup"
      WHERE "userId" = $1
      AND "groupId" = $2
    `, [originalUser.id, originalGroup.id])).rows

    if (originalUserRole.length > 0) {
      throw new Error("User already belongs to this group")
    }

    const newUserGroup = {
      userId: originalUser.id,
      groupId: originalGroup.id,
      role: invited.role,
      updatedAt: new Date()
    }

    const created = await CreateAndLog("UserGroup", newUserGroup)

    if (created?.error) {
      throw new Error(created.error)
    }

    return res.send({ success: true, created })

  } catch (error) {
    Logger.error("Error adding member", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function updateRole(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { userGroupId, newRole, } = req.body

    if (!userGroupId) {
      throw new Error("Invalid userGroup id")
    }

    if (!Object.values(GROUPROLES).includes(newRole)) {
      throw new Error("Invalid role given for new user")
    }

    const originalUserRole = await getGenericById("UserGroup", userGroupId)

    if (!originalUserRole) {
      throw new Error("Original user group not found")
    }

    const role = await getUserGroupRole(user, originalUserRole.groupId)
    if (role?.error) {
      throw new Error(role.error)
    }
    if (role !== GROUPROLES.admin) {
      throw new Error("Only group admins can update members")
    }


    const newUserGroup = {
      ...originalUserRole,
      role: newRole,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("UserGroup", originalUserRole.id, newUserGroup)

    if (updated?.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })

  } catch (error) {
    Logger.error("Error updating member role", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function removeMember(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { userGroupId } = req.body

    if (!userGroupId) {
      throw new Error("Invalid userGroup id")
    }

    const originalUserRole = await getGenericById("UserGroup", userGroupId)

    if (!originalUserRole) {
      throw new Error("Original user group not found")
    }

    const role = await getUserGroupRole(user, originalUserRole.groupId)
    if (role?.error) {
      throw new Error(role.error)
    }
    if (role !== GROUPROLES.admin && originalUserRole.userId !== user.id) {
      throw new Error("Only group admins can remove members, or users can remove themselves")
    }

    const deleted = await DeleteAndLog("UserGroup", originalUserRole.id)

    if (deleted?.error) {
      throw new Error(deleted.error)
    }

    return res.send({ success: true })

  } catch (error) {
    Logger.error("Error deleting member", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}
