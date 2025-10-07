import fs from "node:fs"

export const BanLevels = {
  LoginFailed: "LOGINFAILED",
  OutsideCompany: "OUTSIDECOMPANY"
}

export const LogLevels = {
  INFO: { name: "INFO", value: 4 },
  DEBUG: { name: "DEBUG", value: 3 },
  WARN: { name: "WARN", value: 2 },
  ERROR: { name: "ERROR", value: 1 }
}

export function DefaultLoggerOptions() {
  return {
    consoleLoggingLevel: LogLevels.INFO,
    batchLogging: false,
    batchLogAmount: 100,
    logttl: 1000 * 10,
    fileLoggingLevel: LogLevels.INFO,
    filettl: 1000 * 60 * 60 * 12,
    basePath: "./logs/",
    baseName: "levelUp",
    baseExt: ".log"
  }
}

export class FullBodiedLogger {
  #isWriting = false

  constructor({ consoleLoggingLevel, batchLogging, batchLogAmount, logttl, fileLoggingLevel, filettl, basePath, baseName, baseExt }) {
    this.consoleLoggingLevel = consoleLoggingLevel
    this.batchLogging = batchLogging
    this.batchLogAmount = batchLogAmount
    this.logttl = logttl
    this.fileLoggingLevel = fileLoggingLevel
    this.filettl = filettl
    this.basePath = `${basePath}`.trim().replaceAll("//", "/");
    if (this.basePath[1] !== '/') {
      this.basePath += '/'
    }
    this.baseName = `${baseName}`.trim()
    this.baseExt = `${baseExt}`.trim().replaceAll("..", ".");
    if (this.basePath[0] !== ".") {
      this.basePath = "." + this.basePath
    }
    this.prefix = { dateValue: new Date() }
    this.#loadPrefix();
    this.queue = []
    this.#isWriting = false
    this.#process()
  }

  #flushPrefix() {
    const prefixName = `${this.basePath}prefix.json`
    if (Date.now() - this.prefix.dateValue.getTime() >= this.filettl) {
      const fileName = this.GetFileName()

      const oldFileName = fileName.split("/")[fileName.split("/").length - 1].split('.')
      oldFileName.unshift(this.prefix.dateValue.toISOString().replaceAll(":", ""))

      const finalOldName = `${this.basePath}${oldFileName.join(".")}`
      console.log("[DEBUG] Flush Logs", { fileName, oldFileName, finalOldName, prefixName, prefix: this.prefix })

      fs.rename(fileName, finalOldName, (error) => {
        if (error) {
          console.log("[ERROR] unable to rename old log", { error, prefixName, fileName, oldFileName })
        }
      })
      this.prefix = {
        datevalue: new Date()
      }
      fs.writeFile(`${this.basePath}prefix.json`, JSON.stringify(this.prefix), "utf8", (error) => {
        if (error) {
          console.log("[ERROR] unable to save new prefix", { error, prefixName })
        }
      })
    }
  }

  #loadPrefix() {
    const prefixName = `${this.basePath}prefix.json`
    try {
      fs.exists(prefixName, (exists) => {
        if (exists) {
          fs.readFile(prefixName, "utf8", (error, data) => {
            if (error) {
              console.log("[ERROR] unable to load prefix", { error })
            } else {
              let prefix = JSON.parse(data)
              console.log("[DEBUG] loaded prefix", { prefix: { dateValue: new Date(prefix.datevalue) } })
              this.prefix = { dateValue: new Date(prefix.datevalue) }
            }
          })
        } else {
          fs.writeFile(`${this.basePath}prefix.json`, JSON.stringify(this.prefix), "utf8", (error) => {
            if (error) {
              console.log("[ERROR] unable to save new prefix", { error, prefixName })
            }
          })
        }
      })
      this.#flushPrefix()
    } catch (error) {
      console.log("[ERROR] logger unable to load prefix", { error })
    }
  }

  GetFileName() {
    return `${this.basePath}${this.baseName}${this.baseExt}`
  }

  log(logLevel, message, obj = null, ipaddress = null, banLevel = null) {
    let now = new Date()
    let m = `${logLevel.value} - [${logLevel.name}] - [${now.toISOString()}] - [${now.getTime()}]${banLevel ? ' - [' + banLevel + ']' : ''}${ipaddress ? ' - [' + ipaddress + ']' : ''}: ${message}${obj ? "::" + JSON.stringify(obj) + "\n" : ''}`
    this.queue.push(m)
  }

  info(message, obj = null, ipaddress = null, banLevel = null) {
    this.log(LogLevels.INFO, message, obj, ipaddress, banLevel)
  }

  debug(message, obj = null, ipaddress = null, banLevel = null) {
    this.log(LogLevels.DEBUG, message, obj, ipaddress, banLevel)
  }

  warn(message, obj = null, ipaddress = null, banLevel = null) {
    this.log(LogLevels.WARN, message, obj, ipaddress, banLevel)
  }

  error(message, obj = null, ipaddress = null, banLevel = null) {
    this.log(LogLevels.ERROR, message, obj, ipaddress, banLevel)
  }

  isWriting() {
    return this.#isWriting
  }

  SetWriting(v) {
    this.#isWriting = v ? true : false
  }

  #fileWrite(message) {
    fs.appendFile(this.GetFileName(), message, (error) => {
      if (error) {
        console.log("UNABLE TO PERSIST LOGGER: ", { error })
      }
    })
  }

  #consoleWrite(message) {
    console.log(message)
  }

  #process() {
    setInterval(() => {
      if (this.queue.length > 0 && !this.isWriting()) {
        this.SetWriting(true)

        let length = this.batchLogging ? this.batchLogAmount : this.queue.length
        let items = this.queue.splice(0, length)
        let fileMessages = items.filter(m => parseInt(m[0] <= this.fileLoggingLevel.value))
        let consoleMessages = items.filter(m => parseInt(m[0]) <= this.consoleLoggingLevel.value)

        this.#fileWrite(fileMessages.join("\n") + "\n")
        this.#consoleWrite(consoleMessages.join("\n"))

        this.#flushPrefix()

        this.SetWriting(false)
      }
    }, this.logttl)
  }
}

export const Logger = new FullBodiedLogger(DefaultLoggerOptions())
