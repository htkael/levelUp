import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from "helmet";
import cookieParser from 'cookie-parser'
import { rootRouter } from "./routers/api-router.js"
import { iplog } from "./middleware/iplog.js"
import { Logger } from './shared/logger.js'

const PORT = process.env.PORT || 5678

if (!process.env.VITE_NODE_ENV) {
  throw new Error("VITE_NODE_ENV NOT SET IN .env FILE!!")
}

if (!process.env.VITE_PROD_URL) {
  throw new Error("VITE_PROD_URL NOT SET IN .env FILE!!")
}

const factory = express()

factory.set('trust proxy', true)

factory.use(cookieParser(process.env.SECRET_COOKIE))
factory.use(bodyParser.json({ limit: '100mb' }))
factory.use(bodyParser.urlencoded({ extended: false, limit: "100mb" }))

factory.use(cors({ origin: process.env.VITE_PROD_URL, credentials: true }))


factory.use(iplog)

factory.use((err, req, res, next) => {
  const route = req.originalUrl
  let params
  const contentType = req.get('Content-Type')
  if (contentType && contentType.includes('application/json')) {
    params = JSON.stringify(req.body)
  } else {
    params = "Hiding body for content type" + contentType
  }

  Logger.error('Uncaught exception: ')
  Logger.error(`- Route: ${route}`)
  Logger.error(`- Body: ${params}`)
  Logger.error(`- Error: ${err}`)
  Logger.error(`- Stack: ${err.stack}`)

  return res.status(500).json({
    error: 'Internal Server Error'
  })
})

export function getNonce(length = 32) {
  const buffer = Buffer.alloc(length)
  crypto.getRandomValues(buffer)
  return buffer.toString('hex')
}

factory.use(helmet())

factory.use("/api", rootRouter)

factory.use(express.static("./dist"))
factory.all(/.*/, async (req, res) => {
  return res.sendFile("/usr/src/app/dist/index.html")
})

factory.listen(PORT, '0.0.0.0', () => {
  Logger.info(`Listening on port : ${PORT}...`)
})
