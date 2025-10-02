
export const validateRegister = (data) => {
  if (!data.password || data.password.length < 9) {
    return "Password must be at least 9 characters long";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    return "Please enter a valid email address";
  }

  if (data.password !== data.passwordConf) {
    return "Passwords do not match";
  }

  return null;
};
