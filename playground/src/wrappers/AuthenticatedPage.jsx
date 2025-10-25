import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { Outlet, useNavigate } from "react-router-dom"
import { Header } from "../components/layout/Header"
import { Sidebar } from "../components/layout/Sidebar"

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <Header />
      {/* Main Layout with Fixed Sidebar and Scrollable Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <Sidebar />
        {/* Main Content - removed overflow-y-auto */}
        <main className="flex-1 overflow-hidden bg-base-100">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
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
