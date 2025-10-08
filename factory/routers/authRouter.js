import express from "express"
import { Logger } from "../shared/logger.js"
import { authorize } from "../middleware/authorize.js"
import { tokenCheck, validateUser } from "../auth/auth-helpers.js"
import { logout } from "../end-points/noAuth/login.js"
import { getDashStats } from "../end-points/auth/pages/dashboard.js"
import { createCategory, deleteCategory, updateCategory } from "../end-points/auth/categories.js"

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
