import express from "express"
import { Logger } from "../shared/logger.js"

export const authRouter = express.Router()

authRouter.post("/", function(req, res) {
  Logger.info("LETS GOOO AUTH")
})
