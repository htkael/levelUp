import { Logger } from "../shared/logger.js"
import { ValidateNewUser } from "../middleware/validators.js"
import { Argon2id } from "oslo/password"
import { CreateAndLog } from "../shared/dbFuncs.js"

export async function registerUser(req, res) {
  try {
    const { user } = req.body
    Logger.debug("===== USER INCOMING =====", { user })

    let validatedUser = await ValidateNewUser(user)

    if (validatedUser?.error) {
      throw new Error(validatedUser.error)
    }

    const passwordHash = await new Argon2id().hash(validatedUser.password)

    validatedUser.passwordHash = passwordHash
    validatedUser.updatedAt = new Date()
    delete validatedUser.password

    Logger.debug("validatedUser", validatedUser)

    const newUser = await CreateAndLog("User", validatedUser)

    if (newUser?.error) {
      throw new Error(`Error creating user: ${newUser.error}`)
    }

    return res.send({ success: true })
  } catch (error) {
    Logger.error("Error adding user", { error: error || error.toString() })
    return res.send({ success: false, error: error || error.toString() })
  }
}
