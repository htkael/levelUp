import express from "express";
import { randomUUID } from "crypto"
import { registerUser } from "../controllers/noAuth/register.js";
import { login } from "../controllers/noAuth/login.js";

export const noAuthRouter = express.Router()

noAuthRouter.get("/data", async (req, res) => {
  return res.send({
    randomData: randomUUID()
  })
})

noAuthRouter.post("/create-user", registerUser)
noAuthRouter.post("/login", login)

