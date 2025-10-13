import express from "express"
import { Logger } from "../shared/logger.js"
import { authorize } from "../middleware/authorize.js"
import { tokenCheck, validateUser } from "../auth/auth-helpers.js"
import { logout } from "../end-points/noAuth/login.js"
import { getDashStats } from "../end-points/auth/pages/dashboard.js"
import { createCategory, deleteCategory, getCategoryBasic, getCategoryStats, listCategories, updateCategory } from "../end-points/auth/categories.js"
import { createActivity, deleteActivity, getActivityBasic, getActivityStats, listActivities, toggleActivity, updateActivity } from "../end-points/auth/activities.js"
import { createActivityMetric, deleteActivityMetric, makePrimaryMetric, updateActivityMetric } from "../end-points/auth/activityMetrics.js"
import { createProgressEntry, deleteProgressEntry, getProgressEntry, listProgressEntries, listProgressEntryCalendar, updateProgressEntry } from "../end-points/auth/progressEntries.js"
import { createGoal, deleteGoal, getGoal, listGoals, toggleGoal, updateGoal } from "../end-points/auth/goals.js"

export const authRouter = express.Router()

authRouter.use(authorize)

authRouter.post("/", function(req, res) {
  Logger.info("LETS GOOO AUTH")
})
authRouter.post("/validate-token", validateUser)
authRouter.post("/token-check", tokenCheck)
authRouter.post("/logout", logout)

authRouter.post("/dashboard", getDashStats)

authRouter.post("/category/get", getCategoryBasic)
authRouter.post("/category/list", listCategories)
authRouter.post("/category/stats", getCategoryStats)
authRouter.post("/category/create", createCategory)
authRouter.post("/category/update", updateCategory)
authRouter.post("/category/delete", deleteCategory)

authRouter.post("/activity/get", getActivityBasic)
authRouter.post("/activity/list", listActivities)
authRouter.post("/activity/stats", getActivityStats)
authRouter.post("/activity/create", createActivity)
authRouter.post("/activity/update", updateActivity)
authRouter.post("/activity/delete", deleteActivity)
authRouter.post("/activity/toggle", toggleActivity)

authRouter.post("/activity-metric/create", createActivityMetric)
authRouter.post("/activity-metric/update", updateActivityMetric)
authRouter.post("/activity-metric/delete", deleteActivityMetric)
authRouter.post("/activity-metric/primary", makePrimaryMetric)

authRouter.post("/progress-entry/get", getProgressEntry)
authRouter.post("/progress-entry/list", listProgressEntries)
authRouter.post("/progress-entry/calendar", listProgressEntryCalendar)
authRouter.post("/progress-entry/create", createProgressEntry)
authRouter.post("/progress-entry/update", updateProgressEntry)
authRouter.post("/progress-entry/delete", deleteProgressEntry)

authRouter.post("/goal/get", getGoal)
authRouter.post("/goal/list", listGoals)
authRouter.post("/goal/create", createGoal)
authRouter.post("/goal/update", updateGoal)
authRouter.post("/goal/delete", deleteGoal)
authRouter.post("/goal/toggle", toggleGoal)
