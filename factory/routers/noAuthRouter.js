import express from "express";
import { randomUUID } from "crypto"

export const noAuthRouter = express.Router()

noAuthRouter.get("/", async (req, res) => {
  return res.send({
    randomData: randomUUID()
  })
})


