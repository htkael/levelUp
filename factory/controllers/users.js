import { Logger } from "../shared/logger.js"
import pg from "../pg-cli.js"
import { ValidateNewUser } from "../middleware/validators.js"
import { Argon2id } from "oslo/password"


//model User {
//  id            Int             @id @default(autoincrement())
//  createdAt     DateTime        @default(now())
//  updatedAt     DateTime        @updatedAt
//  username      String          @unique @db.VarChar(80)
//  email         String          @unique @db.VarChar(120)
//  passwordHash  String
//  firstName     String?         @db.VarChar(80)
//  lastName      String?         @db.VarChar(80)
//  UserGroup     UserGroup[]
//  Category      Category[]
//  Activity      Activity[]
//  ProgressEntry ProgressEntry[]
//  Goal          Goal[]
//}

export async function CreateUser(req, res) {
  try {
    const { user } = req.body

    const validatedUser = await ValidateNewUser(user)

    if (validatedUser?.error) {
      throw new Error(validatedUser.error)
    }

    const passwordHash = await new Argon2id().hash(validatedUser.password)

    const newUser = (await pg.query(`
      INSERT INTO "User"
      ("username", "email", "passwordHash")
      VALUES ($1, $2, $3)
      RETURNING *
    `, [validatedUser.username, validatedUser.email, passwordHash])).rows
  }
}
