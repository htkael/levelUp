import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"

export const Dashboard = () => {
  const { user } = useContext(AuthContext)

  console.log("user", user)

  return (
    <div>
      HELLLOOO {user?.username}
    </div>
  )
}
