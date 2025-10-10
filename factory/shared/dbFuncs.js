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
    Logger.error(`${tablename} failed to insert`, { error, objects: { item, tablename } });
    return { error: { msg: `${tablename} failed to insert`, obj: { item, tablename } } };
  }
}

export const UpdateAndLog = async (tablename, itemId, updated, consoleLog = true, client = pg) => {
  try {
    let fields = Object.keys(updated)
    let inserts = fields.map((f) => {
      return `"${f}"`
    })

    let vals = getInputNums(fields)

    let x = []
    let pairs = []

    for (let i = 0; i < vals.length; i++) {
      pairs.push(`${inserts[i]} = ${vals[i]}`)
      x.push(updated[fields[i]])
    }

    let r = (await client.query(`
      UPDATE "${tablename}"
      SET ${pairs.join(",")}
      WHERE id = $${vals.length + 1}
      RETURNING *
    `, [...x, itemId])).rows

    let result = r.length === 1 ? r[0] : undefined

    if (consoleLog) {
      Logger.debug("==== RESULTING UPDATE ====", { item, result })
    }

    if (result) {
      return result
    } else {
      throw new Error(`Unable to update Table[${tablename}] using item: ${JSON.stringify(updated)}`)
    }
  } catch (error) {
    Logger.error(`${tablename} failed to update`, { error, objects: { updated, tablename } });
    return { error: { msg: `${tablename} failed to update`, obj: { item, tablename } } };
  }
}

export const DeleteAndLog = async (tablename, itemId, client = pg) => {
  try {
    let d = (await client.query(`
      DELETE FROM "${tablename}"
      WHERE id = $1
    `, [itemId]))

  } catch (error) {
    Logger.error(`${tablename} failed to delte`, { error, objects: { itemId, tablename } });
    return { error: { msg: `${tablename} failed to delte`, obj: { itemId, tablename } } };
  }
}

export const getGenericById = async (tablename, itemId, client = pg) => {
  try {
    const item = (await client.query(`
      SELECT * FROM ${tablename}
      WHERE id = $1
    `, [itemId])).rows[0]

    return { ...item }
  } catch (error) {
    Logger.error("getGenerecById failed", { tablename, itemId, error })
    return undefined
  }
}
