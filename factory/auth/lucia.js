import { TimeSpan, Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import db from "../prisma-cli.js"

const adapter = new PrismaAdapter(db.session, db.user)

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(72, "h"),
  sessionCookie: {
    expires: true,
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  },

  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      username: attributes.username
    }
  }
})
