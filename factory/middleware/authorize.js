import { lucia } from "../auth/lucia.js"
import { getUserToken } from "../auth/auth-helpers.js"
import { Logger } from "../shared/logger.js"

export function verifyRequestOrigin(originHeader, allowedOrigins) {
  if (!originHeader || !Array.isArray(allowedOrigins)) return false

  try {
    let origin = originHeader

    if (originHeader.includes("http")) {
      const originUrl = new URL(originHeader)
      origin = `${originUrl.protocol}//${originUrl.host}`
    }

    return allowedOrigins.includes(origin)
  } catch (error) {
    Logger.error("verifyRequestOrigin failed", { error })
    return false
  }
}

export function verifiedOrigins(host) {
  const verified = [host]
  verified.push(process.env.VITE_PROD_URL)
  return verified
}

export function getURLOrigin(url) {
  try {
    return new URL(url).origin
  } catch (error) {
    Logger.error("unable to get URL origin", { error })
    return null
  }
}

export async function authorize(req, res, next) {
  try {
    let originHeader = req.headers.origin
    let hostHeader = req.headers.host
    let forwardedHost = req.headers['x-forwarded-host']
    let referrer = req?.headers?.referrer || req?.headers?.referer

    if (!hostHeader) {
      if (forwardedHost) {
        hostHeader = forwardedHost
      }
    }

    if (!hostHeader) {
      throw "no valid host exits"
    }

    if (!originHeader) {
      if (referrer) {
        originHeader = getURLOrigin(referrer)
      } else {
        originHeader = hostHeader
      }
    }

    if (!originHeader) {
      throw "no valid origin exists"
    }

    if (!verifyRequestOrigin(originHeader, verifiedOrigins(hostHeader))) {
      Logger.error("unverified request origin", { originHeader, hostHeader, verifiedOrigins: verifiedOrigins(hostHeader), url: req.originalUrl, cookies: req.cookies, body: req.body, headers: req.headers })
      throw 'invalid origin'
    }

    let sessionId = getUserToken(req)

    if (!sessionId) {
      throw "no session id"
    }

    const { session, user } = await lucia.validateSession(sessionId)

    if (!user) {
      throw "no user"
    }

    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      res.cookie(sessionCookie.name, sessionCookie.value, {
        secuire: process.env.VITE_NODE_ENV === 'production',
        path: "/",
        sameSite: 'lax',
        httpOnly: true,
        expiresAt: sessionCookie.attributes?.expires,
        maxAge: sessionCookie.attributes?.maxAge
      })
    }

    res.locals.user = user

    next()
  } catch (error) {
    Logger.error("unable to authorize", { error })
    return res.send({ error: "Unauthorized" })
  }
}
