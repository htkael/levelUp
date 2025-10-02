import pg from "../../pg-cli.js";
import { lucia } from "../../auth/lucia.js"
import { Argon2id } from "oslo/password"
import { Logger } from "../../shared/logger.js";
import { isValidEmail } from "../../auth/auth-helpers.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || typeof email !== 'string') {
      throw new Error("Invalid email or password")
    }

    if (!password || typeof password !== 'string') {
      throw new Error("Invalid email or password")
    }

    let user;
    let foundUser
    if (isValidEmail(email)) {
      Logger.debug('📧', email);
      foundUser = (await pg.query(`SELECT * FROM "User" WHERE LOWER("email") = LOWER($1)`, [email])).rows
    } else {
      Logger.debug('👤', email);
      foundUser = (await pg.query(`SELECT * FROM "User" WHERE LOWER("username") = LOWER($1)`, [email])).rows
    }

    if (foundUser.length < 1) {
      Logger.error('❌ NO USER FOUND', { email });
      throw new Error("Invalid email or password")
    }

    user = foundUser[0]

    if (!user) {
      Logger.error('❌ NO USER FOUND', { email });
      throw new Error("Invalid email or password")
    }

    if (!user.passwordHash) {
      Logger.error('❌ INVALID PASSWORD', { email });
      throw new Error("Invalid email or password")
    }

    if (!password) {
      Logger.error('❌ INVALID PASSWORD', { email });
      throw new Error("Invalid email or password")
    }

    const validPassword = await new Argon2id().verify(user.passwordHash, password)

    if (!validPassword) {
      Logger.error('❌ INVALID PASSWORD', { email });
      throw new Error("Invalid email or password")
    }

    Logger.debug('⚡️', { user: { id: user.id, username: user.username, email: user.email } });
    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    let userData = {
      ...user,
      passwordHash: null,
    }

    await new Promise(resolve => setTimeout(resolve, 1940))

    res.cookie(sessionCookie.name, sessionCookie.value, {
      secure: process.env.VITE_NODE_ENV === 'production',
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxAge: 24 * 60 * 60 * 1000
    })

    return res.send({
      success: true,
      setCookie: sessionCookie.serialize(),
      token: session.id,
      user: userData
    })

  } catch (error) {
    Logger.error("failed to login", { error: error.message })
    await new Promise(resolve => setTimeout(resolve, 2000))
    return res.send({ success: false, error: error.message })
  }
}
