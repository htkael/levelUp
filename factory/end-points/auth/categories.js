import pg from "../../pg-cli.js"

//model Category {
//  id          Int        @id @default(autoincrement())
//  createdAt   DateTime   @default(now())
//  updatedAt   DateTime   @updatedAt
//  name        String     @db.VarChar(100)
//  description String?
//  color       String?    @db.VarChar(7)
//  user        User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
//  userId      Int?
//  group       Group?     @relation(fields: [groupId], references: [id], onDelete: Cascade)
//  groupId     Int?
//  Activity    Activity[]
//
//  @@unique([userId, name])
//  @@unique([groupId, name])
//}

export async function listCategories(req, res) {
  try {
    const user = res?.locals?.user

    if (!user) {
      throw new Error("Invalid User")
    }

    const categories = (await pg.query(`
    SELECT * FROM "Category"
    WHERE "userId" = $1
    `, [user.id])).rows

    return res.send({ success: true, categories })
  } catch (error) {
    Logger.error("Unable to list categoires", { error: error.message })
  }
}
