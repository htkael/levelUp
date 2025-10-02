import { useContext } from "react"
import { AuthContext } from "../../contexts/AuthContext"

export const Header = () => {
  const { user, handleLogout } = useContext(AuthContext)

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1 ml-4">
        <h1 className="text-xl font-bold">Level Up Dashboard</h1>
      </div>
      <div className="flex-none gap-2 mr-4">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10 flex justify-center items-center">
              <span className="text-lg">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            <li><a className="justify-between">Profile</a></li>
            <li><a className="justify-between">Settings</a></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
