import express from "express"
import { Logger } from "../shared/logger.js"
import { authorize } from "../middleware/authorize.js"
import { tokenCheck, validateUser } from "../auth/auth-helpers.js"

export const authRouter = express.Router()

authRouter.use(authorize)

authRouter.post("/", function(req, res) {
  Logger.info("LETS GOOO AUTH")
})
authRouter.post("/validate-token", validateUser)
authRouter.post("/token-check", tokenCheck)
