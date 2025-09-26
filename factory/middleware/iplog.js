import { Logger } from "../shared/logger";

export async function iplog(req, res, next) {
  try {
    Logger.info(
      `${req.originalUrl}`,
      null,
      req.ip || req.headers['x-forwarded-for']
    )
    next()
  } catch (error) {
    Logger.error(`failed to log ip middleware: ${JSON.stringify(error)}`)
  }
}
