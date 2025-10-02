import express from "express";
import { randomUUID } from "crypto"
import { registerUser } from "../end-points/noAuth/register.js";
import { login } from "../end-points/noAuth/login.js";

export const noAuthRouter = express.Router()

noAuthRouter.get("/data", async (req, res) => {
  return res.send({
    randomData: randomUUID()
  })
})

noAuthRouter.post("/register", registerUser)
noAuthRouter.post("/login", login)

