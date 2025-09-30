import pg from "../pg-cli.js"
import { Logger } from "./logger.js"

export const getInputNums = (inputs) => {
  let vars = []
  if (inputs.length > 0) {
    vars = inputs.map((r, i) => {
      return `$${i + 1}`
    })
  }
  return vars
}

export const CreateAndLog = async (tablename, item, consoleLog = true, client = pg) => {
  try {
    let mutable = { ...item }
    { }
    let fields = Object.keys(mutable)
    let inserts = fields.map((f) => {
      return `"${f}"`
    })

    let vals = getInputNums(fields)

    let x = []

    for (let i = 0; i < vals.length; i++) {
      x.push(mutable[fields[i]])
      if (consoleLog) {
        Logger.debug(`<${fields[i]}> => <${mutable[fields[i]]}>`)
      }
    }

    let r = (await client.query(`
      INSERT INTO "${tablename}" (${inserts.join(",")})
      VALUES (${vals.join(",")})
      RETURNING *
    `, [...x])).rows

    let result = r.length === 1 ? r[0] : undefined

    if (consoleLog) {
      Logger.debug("==== RESULTING CREATE ====", { item, result })
    }

    if (result) {
      return result
    } else {
      throw new Error(`Unable to insert into Table[${tablename}] using item: ${JSON.stringify(item)}`)
    }
  } catch (error) {
    Logger.error(`${tablename} failed to insert`, { error, objects: { item, tablename, consoleLog } });
    return { error: { msg: `${tablename} failed to insert`, obj: { item, tablename, consoleLog } } };
  }
}
