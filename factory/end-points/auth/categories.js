import { CreateAndLog, DeleteAndLog, getGenericById, getUserGroupRole, UpdateAndLog } from "../../shared/dbFuncs.js"
import { Logger } from "../../shared/logger.js"
import pg from "../../pg-cli.js"

export async function getCategoryBasic(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { id } = req.body

    if (!id) {
      throw new Error("Category id required")
    }

    let category = await getGenericById("Category", id)

    if (!category) {
      throw new Error("Original activity not found")
    }

    let activities = (await pg.query(`
      SELECT "name", "description", "isActive"
      FROM "Activity"
      WHERE "categoryId" = $1
    `, [category.id])).rows

    category.activities = activities

    return res.send({ success: true, category })
  } catch (error) {
    Logger.error("Unable to get basic category info", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function listCategories(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { groupId } = req.body

    let searchId = user.id
    let searchField = "userId"

    if (groupId) {
      searchField = "groupId"
      searchId = groupId
    }

    const categories = (await pg.query(`
      SELECT c.name, c.description, c.color,
      COUNT(DISTINCT a.id) as activities
      FROM "Category" c
      LEFT JOIN "Activity" a ON a."categoryId" = c.id AND a."${searchField}" = $1
      WHERE c."${searchField}" = $1
      GROUP BY c.id, c.name, c.description, c.color
    `, [searchId])).rows

    return res.send({ success: true, categories })
  } catch (error) {
    Logger.error(`Error listing categories`, { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function getCategoryStats(req, res) {
  const client = await pg.connect()

  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid user")
    }

    const { id } = req.body

    if (!id) {
      throw new Error("Category id required")
    }

    const [overviewResult, mostEntries, lastLoggedEntry, timeBasedResult, entryDatesResult, otherStatsResult] = await Promise.all([
      pg.query(`
        SELECT
          COUNT(DISTINCT a.id) as "totalActivities",
          COUNT(pe.id) as "totalEntries",
          MIN("entryDate") as "firstEntry",
          MAX("entryDate") as "lastEntry",
          COUNT(DISTINCT a.id) FILTER (WHERE a."isActive" = false) as "hiddenActivityCount"
        FROM "Category" c
        LEFT JOIN "Activity" a ON a."categoryId" = c.id
        LEFT JOIN "ProgressEntry" pe ON pe."activityId" = a.id
        WHERE c.id = $1
        GROUP BY c.id
      `, [id]),

      pg.query(`
        SELECT
          a."name",
          COUNT(pe.id) AS "mostEntries"
        FROM "Activity" a
        LEFT JOIN "ProgressEntry" pe ON pe."activityId" = a.id
        WHERE a."categoryId" = $1
        GROUP BY a.id, a.name
        ORDER BY "mostEntries" DESC
        LIMIT 1
      `, [id]),

      pg.query(`
        SELECT
          a.id,
          a.name,
          MAX(pe."entryDate") as "lastEntry"
        FROM "Activity" a
        LEFT JOIN "ProgressEntry" pe ON pe."activityId" = a.id
        WHERE a."categoryId" = $1
        GROUP BY a.id, a.name
        ORDER BY "lastEntry" DESC
        LIMIT 1
      `, [id])
    ])


  } catch (error) {
    Logger.error("Error getting stats for category", { categoryId: id, error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function createCategory(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { category } = req.body

    if (!category?.name) {
      throw new Error("Category name required")
    }

    if (!(category?.groupId || category?.userId)) {
      throw new Error("A group id or user id is required to create a category")
    }

    if (category?.userId && category?.groupId) {
      throw new Error("A category can only belong to a group OR a user")
    }

    const newCategory = {
      ...category,
      updatedAt: new Date()
    }

    const created = await CreateAndLog("Category", newCategory)

    if (created.error) {
      throw new Error(created.error)
    }

    return res.send({ success: true, created })
  } catch (error) {
    Logger.error("Unable to create category", { error: error.message })
    return res.send({ success: false, error: error })
  }
}

export async function updateCategory(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { category } = req.body

    const original = await getGenericById("Category", category.id)

    if (!original) {
      throw new Error("Original category not found")
    }

    if (original?.userId && !(original.userId === user.id)) {
      throw new Error("Only the owner of the category can edit the category")
    }

    if (original?.groupId) {
      const role = await getUserGroupRole(user, original.groupId)
      if (role !== "ADMIN") {
        throw new Error("Only a group admin can edit the group")
      }
    }

    const newCategory = {
      ...original,
      name: category?.name ? category.name : original.name,
      description: category?.description ? category.description : original?.description,
      color: category?.color ? category.color : original?.color,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("Category", original.id, newCategory)

    if (updated.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })
  } catch (error) {
    Logger.error("Unable to update category", { error: error.message })
    return res.send({ success: false, error: error })
  }
}

export async function deleteCategory(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const { id } = req.body

    if (!id) {
      throw new Error("Category id required")
    }

    const original = await getGenericById("Category", id)

    if (!original) {
      throw new Error("Original category not found")
    }

    if (original?.userId && !(original.userId === user.id)) {
      throw new Error("Only the owner of the category can delete the category")
    }

    if (original?.groupId) {
      const role = await getUserGroupRole(user, original.groupId)
      if (role !== "ADMIN") {
        throw new Error("Only a group admin can delete  the group")
      }
    }

    const deleted = await DeleteAndLog("Category", id)

    if (deleted.error) {
      throw new Error(deleted.error)
    }

    return res.send({ success: true })
  } catch (error) {
    Logger.error("Unable to delete category", { error })
    return res.send({ success: false, error: error })
  }
}
