import pg from "../pg-cli.js"
import { Logger } from "../shared/logger.js"

export const ValidateNewUser = async (user) => {
  let ValidatedUser = {
    username: null,
    email: null,
    password: null,
    firstName: null,
    lastName: null
  }
  try {
    if (user.firstName) {
      let fn = user.firstName.trim()
      let fnCheck = checkNames(fn)
      if (fnCheck) {
        return { error: fnCheck }
      }
      ValidatedUser.firstName = fn
    }

    if (user.lastName) {
      let ln = user.lastName.trim()
      let lnCheck = checkNames(ln)
      if (lnCheck) {
        return { error: lnCheck }
      }
      ValidatedUser.lastName = ln
    }

    if (!(user.username && user.email && user.password && user.passwordConf)) {
      return { error: "Some or all required fields not present, please try again." }
    }

    if (user.password.trim() !== user.passwordConf.trim()) {
      return { error: "Passwords do not match" }
    }

    let checkPass = checkPassword(user.password)
    if (checkPass) {
      return { error: checkPass }
    }
    ValidatedUser.password = user.password

    let ce = user.email.trim().toLowerCase()
    let emailCheck = checkEmail(ce)
    if (emailCheck) {
      return { error: checkEmail }
    }

    try {
      let foundEmail = (await pg.query(`
      SELECT id FROM "User"
      WHERE "email" = $1
    `, [ce])).rows

      if (foundEmail.length > 0) {
        return { error: `User with this email already exists.` }
      }

    } catch (error) {
      Logger.error("Unable to look up email", { error })
      return { error: "unable to validate user at this time, please try again" }
    }
    ValidatedUser.email = ce

    let un = user.username.trim()
    let userCheck = checkUsername(un)
    if (userCheck) {
      return { error: userCheck }
    }

    try {
      let foundUsername = (await pg.query(`
        SELECT id FROM "User"
        WHERE "username" = $1
      `, [un])).rows
      if (foundUsername.length > 0) {
        return { error: `User with this username already exists. Please select a new username` }
      }
    } catch (error) {
      Logger.error("Unable to look up username", { error })
      return { error: "unable to validate user at this time, please try again" }
    }
    ValidatedUser.username = un

    return ValidatedUser;


  } catch (error) {
    Logger.error("====== Failed to vaildate new user ======", { error: error.message })
    return { error: error.message || "An unexpected error occurred during validation" }
  }
}

export function checkNames(n) {
  let x = `${n}`.trim();

  let spec = `~!@#$%^\\&*(()+=][|\` \t\n/?.,<>';:"`.split("");
  let specFound = false;
  for (let i = 0; i < spec.length; i++) {
    if (x.includes(spec[i])) {
      specFound = true;
      break;
    }
  }
  if (specFound) {
    return "first or last name cannot contain special characters other than _ or -";
  }

  return null;
}

export function checkUsername(u) {
  let x = `${u}`.trim().split("");
  if (x.length < 3) {
    return "username too short (must be at least 3 characters long)";
  }

  // USERNAMES CAN CONTAIN UNDERSCORES AND DASHES BUT NO OTHER BS
  let baddies = `~!@#$%^\\&*(()+=][|\` \t\n/?,<>';:"`.split("");
  let badFound = false;
  for (let i = 0; i < baddies.length; i++) {
    if (x.includes(baddies[i])) {
      badFound = true;
      break;
    }
  }
  if (badFound) {
    return "username cannot contain special characters other than _ and . and -";
  }

  return null;
}

export function checkEmail(e) {
  let c = `${e}`.trim().toLowerCase();

  if (c.length < 8) {
    return "email too short (must be at least 8 characters long)";
  }

  if (e[0] === "@") {
    return "invalid email format must not start with @";
  }

  let parts = c.split("@");

  if (parts.length < 2) {
    return "invalid format must have @ in the email";
  }

  let failed = "";
  for (let part of parts) {
    const pieces = part.split(".");
    for (let piece of pieces) {
      if (piece.length < 1) {
        failed = "leading or trailing dot not allowed";
      }
      if (piece.startsWith("-") || piece.startsWith("_") || piece.endsWith("-") || piece.endsWith("_")) {
        failed = "leading or trailing dashes or underscores not allowed";
      }
    }
  }
  if (failed.length > 0) {
    return failed;
  }

  if (parts[0].length < 1 || parts.slice(1).join("").length < 3) {
    return "invalid email format";
  }

  if (parts.slice(1).join("").split(".").length < 2) {
    return "invalid email format missing domain";
  }

  if (c.includes("..")) {
    return "invalid email format (consecutive dots)";
  }

  const spaces = [' ', '\t', '\n', '\r'];
  for (let item of spaces) {
    if (c.includes(item)) {
      return "invalid email format (whitespace not allowed)";
    }
  }

  let domain = parts.slice(1).join("");
  let tld = domain.split(".").pop();
  if (tld.length < 2) {
    return "invalid email format (invalid TLD)";
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.\-_]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(e)) {
    return "invalid email format";
  }

  return null;
}

export const checkPassword = (p) => {
  let x = `${p}`.split("")

  if (x.length < 9) {
    return "Password too short (must be at least 9 characters long)"
  }

  let spec = `~!@#$%^\\&*(()_+=-][|\` \t\n/?.,<>';:"`.split("");
  let specFound = false
  for (let i = 0; i < spec.length; i++) {
    if (x.includes(spec[i])) {
      specFound = true;
      break
    }
  }
  if (!specFound) {
    return "Password must contain at least one special character"
  }

  let nums = `1234567890`.split("");
  let numCount = 0
  let threeNums = false
  for (let i = 0; i < nums.length; i++) {
    if (x.includes(nums[i])) {
      numCount++
      if (numCount > 2) {
        threeNums = true
        break
      }
    }
  }
  if (!threeNums) {
    return "Password must contain at least three numbers"
  }

  let lowers = 'abcdefghijklmnopqrstuvwxyz'.split("")
  let lowerFound = false
  for (let i = 0; i < lowers.length; i++) {
    if (x.includes(lowers[i])) {
      lowerFound = true
      break
    }
  }
  if (!lowerFound) {
    return "Password must contain at least one lowercase letter"
  }

  let uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split("")
  let upperFound = false
  for (let i = 0; i < uppers.length; i++) {
    if (x.includes(uppers[i])) {
      upperFound = true
      break
    }
  }
  if (!upperFound) {
    return "Password must contain at least one uppercase letter"
  }

  return null
}
