import { useContext } from "react"
import { AuthContext } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"

export const Header = () => {
  const { user, handleLogout } = useContext(AuthContext)

  return (
    <div className="navbar bg-base-100 shadow-sm border-b border-base-300">
      <div className="flex-1 ml-4">
        <h1 className="text-xl font-bold">Level Up Dashboard</h1>
      </div>
      <div className="flex-none gap-2 mr-4">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <span className="text-lg font-semibold">
                {user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            <li className="menu-title">
              <span>{user?.firstName || user?.username}</span>
            </li>
            <li><Link to="/settings/profile">Profile</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
