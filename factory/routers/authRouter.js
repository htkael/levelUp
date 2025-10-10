import express from "express"
import { Logger } from "../shared/logger.js"
import { authorize } from "../middleware/authorize.js"
import { tokenCheck, validateUser } from "../auth/auth-helpers.js"
import { logout } from "../end-points/noAuth/login.js"
import { getDashStats } from "../end-points/auth/pages/dashboard.js"
import { createCategory, deleteCategory, updateCategory } from "../end-points/auth/crud/categories.js"
import { createActivity, deleteActivity, updateActivity } from "../end-points/auth/crud/activities.js"
import { createActivityMetric, deleteActivityMetric, updateActivityMetric } from "../end-points/auth/crud/activityMetrics.js"
import { createProgressEntry, deleteProgressEntry, updateProgressEntry } from "../end-points/auth/crud/progressEntries.js"

export const authRouter = express.Router()

authRouter.use(authorize)

authRouter.post("/", function(req, res) {
  Logger.info("LETS GOOO AUTH")
})
authRouter.post("/validate-token", validateUser)
authRouter.post("/token-check", tokenCheck)
authRouter.post("/logout", logout)

authRouter.post("/dashboard", getDashStats)

authRouter.post("/category/create", createCategory)
authRouter.post("/category/update", updateCategory)
authRouter.post("/category/delete", deleteCategory)

authRouter.post("/activity/create", createActivity)
authRouter.post("/activity/update", updateActivity)
authRouter.post("/activity/delete", deleteActivity)

authRouter.post("/activity-metric/create", createActivityMetric)
authRouter.post("/activity-metric/update", updateActivityMetric)
authRouter.post("/activity-metric/delete", deleteActivityMetric)

authRouter.post("/progress-entry/create", createProgressEntry)
authRouter.post("/progress-entry/update", updateProgressEntry)
authRouter.post("/progress-entry/delete", deleteProgressEntry)
