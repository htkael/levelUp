import { Link, useLocation } from "react-router-dom"
import { useDashboard } from "../../hooks/useDashboard"

export const Sidebar = () => {
  const location = useLocation()

  const navItems = [
    { path: "/", icon: "📊", label: "Dashboard" },
    { path: "/categories", icon: "📁", label: "Categories" },
    { path: "/activities", icon: "🎯", label: "Activities" },
    { path: "/calendar", icon: "📅", label: "Calendar" },
    { path: "/goals", icon: "🏆", label: "Goals" },
    { path: "/groups", icon: "👥", label: "Groups" },
  ]

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  const { data, isLoading } = useDashboard()
  const streak = data?.stats?.currentStreak

  return (
    <div className="w-64 bg-base-300 h-full border-r border-base-300 flex flex-col overflow-y-auto">
      <div className="p-4 flex-1">
        <ul className="menu menu-lg gap-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={isActive(item.path) ? "active" : ""}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="divider mx-4 my-2"></div>

      {/* Compact Streak Display */}
      <div className="px-4 pb-4">
        <div className="bg-base-100 rounded-lg shadow-sm p-3">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <span className="loading loading-spinner loading-sm"></span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="text-xs text-base-content/60 mb-1">Current Streak</div>
              <div className="text-3xl font-bold text-primary flex items-center gap-1">
                {streak || 0}
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-xs text-base-content/60 mt-1">
                {streak > 0 ? "Keep it up!" : "Start logging!"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
