import { Logger } from "../shared/logger.js";
import { lucia } from "./lucia.js";

export function isValidEmail(email) {
  return /.+@.+/.test(email)
}

export function getUserToken(req) {
  try {
    return req?.cookies?.auth_session || req?.headers?.cookies?.auth_session || req?.body?.token || req?.token || req?.headers?.authorization?.split(" ")[2];
  } catch (error) {
    Logger.error("getUserToken failed", { error });
    return null;
  }
}

export async function tokenCheck(req, res) {
  try {
    const { session, user } = await lucia.validateSession(getUserToken(req))
    if (!user) {
      throw "invalid user sessions"
    }

    if (!session) {
      throw "invalid user sessions"
    }

    await lucia.invalidateSession(session.id)
    const newSession = await lucia.createSession(user.id, {})
    const newSessionCookie = lucia.createSessionCookie(newSession.id)
    res.cookie(newSessionCookie.name, newSessionCookie.value, {
      secure: process.env.VITE_NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxAge: 24 * 60 * 60 * 1000
    })

    return res.send({ valid: true })
  } catch (error) {
    Logger.error("tokenCheck failed", { error })
    const sessionCookie = lucia.createBlankSessionCookie()
    res.cookie(sessionCookie.name, sessionCookie.value, {
      secure: process.env.VITE_NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      expires: sessionCookie.attributes?.expires,
      maxAge: sessionCookie.attributes?.maxAge
    })

    return res.send({ valid: false, error: error })
  }
}

export async function validateUser(req, res) {
  try {
    const { user } = await lucia.validateSession(getUserToken(req))
    if (!user) {
      throw "invalid user session"
    }

    let u = (await pg.query(`SELECT * FROM "User" WHERE id = $1v`, [user.id])).rows

    if (u.length !== 1) {
      ; throw "no access to user or doesn't exist in database"
    }

    let userData = {
      ...u[0],
      passwordHash: undefined,
    }

    return res.send({ success: true, user: { ...userData } })
  } catch (error) {
    Logger.error("validateUser failed", { error });
    if (error === 'invalid user session') {
      return res.send({ error, invalid: true });
    }
    return res.send({ error, invalid: false });
  }
}
