import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api.js"
import { deleteCookie } from "../utils/auth.js";

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(undefined)
  const [user, setUser] = useState(null)

  const navigate = useNavigate()

  const validateToken = async () => {
    try {
      const res = await api("/auth/validate-token")

      if (res.success) {
        setIsAuthenticated(true)
        setUser(res.user)
      } else {
        deleteCookie("authToken")
        setIsAuthenticated(false)
        setUser(null)
        if (window.location.pathname === "/login") {
          return
        } else {
          await handleLogout()
        }
      }
    } catch (error) {
      console.error("Token validation error:", error)
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    validateToken()
  }, [])

  const handleLogin = async (email, password) => {
    const res = await api("/no-auth/login", { email, password })
    if (res?.success) {
      setIsAuthenticated(true)
      setUser(res.user)
      navigate("/", { replace: true })
    }
    return res
  }

  const handleLogout = async () => {
    await api("/auth/logout")
    setIsAuthenticated(false)
    setUser(null)
    deleteCookie("authToken")
    const allowed = ['login', 'register']
    let okay = false
    for (let i = 0; i < allowed.length; i++) {
      if (window.location.href.includes(allowed[i])) {
        okay = true
        break
      }
    }
    if (!okay) {
      navigate("/login", { replace: true });
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
