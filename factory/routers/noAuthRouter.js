import express from "express";
import { randomUUID } from "crypto"
import { CreateUser } from "../controllers/users.js";

export const noAuthRouter = express.Router()

noAuthRouter.get("/data", async (req, res) => {
  return res.send({
    randomData: randomUUID()
  })
})

// START USER
noAuthRouter.post("/create-user", CreateUser)

