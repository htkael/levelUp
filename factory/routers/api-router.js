import express from "express";
import { authRouter } from "./authRouter.js"
import { noAuthRouter } from "./noAuthRouter.js"

export const rootRouter = express.Router()
rootRouter.use(express.json({ limit: '100mb' }))

rootRouter.use("/no-auth", noAuthRouter)
rootRouter.use("/auth", authRouter)

rootRouter.use(function(req, res, next) {
  res.status(404)
  res.json({ error: `Not Found: ${req.originalUrl}` })
})
