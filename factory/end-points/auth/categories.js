import { CreateAndLog, DeleteAndLog, getGenericById, UpdateAndLog } from "../../shared/dbFuncs.js"

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

    if (!(category?.groupId && category?.userId)) {
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
    Logger.error("Unable to create categoiry", { error: error.message })
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

    if (!category?.name) {
      throw new Error("Category name required")
    }

    if (!(category?.groupId && category?.userId)) {
      throw new Error("A group id or user id is required to create a category")
    }

    if (category?.userId && category?.groupId) {
      throw new Error("A category can only belong to a group OR a user")
    }

    const original = await getGenericById("Category", category.id)

    if (!original) {
      throw new Error("Original category not found")
    }

    const newCategory = {
      ...category,
      updatedAt: new Date()
    }

    const updated = await UpdateAndLog("Category", original.id, newCategory)

    if (updated.error) {
      throw new Error(updated.error)
    }

    return res.send({ success: true, updated })
  } catch (error) {
    Logger.error("Unable to update categoiry", { error: error.message })
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
