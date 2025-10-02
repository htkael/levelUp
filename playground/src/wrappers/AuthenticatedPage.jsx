import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { Outlet, useNavigate } from "react-router-dom"

const AuthenticatedPage = () => {
  const { user, handleLogout } = useContext(AuthContext)

  useEffect(() => {
    const intervalId = setInterval(() => {
      (async () => {
        try {
          const resp = await api("/auth/token-check")
          if (!resp?.valid) {
            await handleLogout()
          }
        } catch (error) {
          console.error("Token check failed", error)
        }
      })()
    }, 1000 * 60 * 5)
    return () => clearInterval(intervalId)
  }, [handleLogout])

  return (
    <div className="min-h-screen flex">
      <div className="min-w-screen">
        <Outlet user={user} />
      </div>
    </div>
  );
}

export const AuthenticatedPageWrapper = () => {
  const { isAuthenticated } = useContext(AuthContext)

  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

  return (
    <>
      {isAuthenticated ? <AuthenticatedPage /> : null}
    </>
  )
}
