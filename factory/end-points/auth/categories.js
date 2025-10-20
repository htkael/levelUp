import { CreateAndLog, DeleteAndLog, getGenericById, getUserGroupRole, UpdateAndLog } from "../../shared/dbFuncs.js"
import { Logger } from "../../shared/logger.js"
import pg from "../../pg-cli.js"
import { calculateStreak } from "../../shared/utils.js"

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
      SELECT id, "name", "description", "isActive"
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
      SELECT c.id, c.name, c.description, c.color,
      COUNT(DISTINCT a.id) as activities,
      MAX(pe."entryDate") as "lastEntryDate"
      FROM "Category" c
      LEFT JOIN "Activity" a ON a."categoryId" = c.id AND a."${searchField}" = $1
      LEFT JOIN "ProgressEntry" pe ON pe."activityId" = a.id
      WHERE c."${searchField}" = $1
      GROUP BY c.id, c.name, c.description, c.color
      ORDER BY c."createdAt" DESC
    `, [searchId])).rows

    return res.send({ success: true, categories })
  } catch (error) {
    Logger.error(`Error listing categories`, { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}

export async function getCategoryStats(req, res) {
  try {
    const user = res?.locals?.user
    if (!user) {
      throw new Error("Invalid user")
    }
    const { id } = req.body

    if (!id) {
      throw new Error("Category id required")
    }

    const [overviewResult, mostEntries, lastLoggedEntry, activeAndInactiveCount, weeklyEntries, monthlyEntries, entryDatesResult] = await Promise.all([
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
      `, [id]),

      pg.query(`
        SELECT
          COUNT(*) FILTER (WHERE a."isActive" = true) as "activeCount",
          COUNT(*) FILTER (WHERE a."isActive" = false) as "inactiveCount"
        FROM "Activity" a
        WHERE a."categoryId" = $1
      `, [id]),

      pg.query(`
        SELECT
          COUNT(pe.id) as "weeklyEntries"
        FROM "Activity" a
        LEFT JOIN "ProgressEntry" pe ON pe."activityId" = a.id
          AND pe."entryDate" >= DATE_TRUNC('week', CURRENT_DATE)
        WHERE a."categoryId" = $1
      `, [id]),

      pg.query(`
        SELECT
          COUNT(pe.id) as "monthlyEntries"
        FROM "Activity" a
        LEFT JOIN "ProgressEntry" pe ON pe."activityId" = a.id
          AND pe."entryDate" >= DATE_TRUNC('month', CURRENT_DATE)
        WHERE a."categoryId" = $1
      `, [id]),

      pg.query(`
        SELECT DISTINCT pe."entryDate"::date as "entryDate"
        FROM "Activity" a
        LEFT JOIN "ProgressEntry" pe on pe."activityId" = a.id
        WHERE a."categoryId" = $1
        AND pe."entryDate" IS NOT NULL
        ORDER BY "entryDate" DESC
      `, [id])
    ])

    const totalEntries = overviewResult.rows[0].totalEntries
    const firstEntry = overviewResult.rows[0].firstEntry
    const daysSinceFirst = Math.floor((new Date() - new Date(firstEntry)) / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.ceil(daysSinceFirst / 7) || 1
    const averagePerWeek = (totalEntries / totalWeeks).toFixed(1)
    const streak = calculateStreak(entryDatesResult.rows)
    const totalDaysLogged = entryDatesResult.rows.length
    const percentageLogged = ((totalDaysLogged / daysSinceFirst) * 100).toFixed(1)

    return res.send({
      success: true,
      data: {
        overview: overviewResult.rows[0],
        mostTrackedActivity: mostEntries.rows[0],
        lastLoggedActivity: lastLoggedEntry.rows[0],
        activityCounts: activeAndInactiveCount.rows[0],
        weeklyEntries: weeklyEntries.rows[0].weeklyEntries,
        monthlyEntries: monthlyEntries.rows[0].monthlyEntries,
        averagePerWeek: parseFloat(averagePerWeek),
        streak,
        totalDaysLogged,
        engagementRate: parseFloat(percentageLogged)
      }
    })
  } catch (error) {
    Logger.error("Error getting stats for category", { categoryId: req.params?.id, error: error.message })
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

    const newCategory = {
      ...category,
      userId: category?.groupId ? null : user.id,
      groupId: category?.groupId ? category.groupId : null,
      updatedAt: new Date()
    }

    const created = await CreateAndLog("Category", newCategory)

    if (created?.error) {
      throw new Error(created.error)
    }

    return res.send({ success: true, created })
  } catch (error) {
    Logger.error("Unable to create category", { error: error.message })
    return res.send({ success: false, error: error.message })
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
      if (role.error) {
        throw new Error(role.error)
      }
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

    if (updated?.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })
  } catch (error) {
    Logger.error("Unable to update category", { error: error.message })
    return res.send({ success: false, error: error.message })
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
      if (role?.error) {
        throw new Error(role.error)
      }
      if (role !== "ADMIN") {
        throw new Error("Only a group admin can delete  the group")
      }
    }

    const deleted = await DeleteAndLog("Category", id)

    if (deleted?.error) {
      throw new Error(deleted.error)
    }

    return res.send({ success: true })
  } catch (error) {
    Logger.error("Unable to delete category", { error: error.message })
    return res.send({ success: false, error: error.message })
  }
}
