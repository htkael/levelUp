import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import {
  PlusIcon,
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline"

export const Dashboard = () => {
  const { user, handleLogout } = useContext(AuthContext)

  const stats = {
    totalCategories: 5,
    weeklyActivities: 12,
    currentStreak: 7,
    totalEntries: 156
  }

  const recentActivities = [
    { id: 1, category: "Fitness", activity: "Morning Run", date: "2025-10-02", metric: "5km in 25min" },
    { id: 2, category: "Learning", activity: "React Tutorial", date: "2025-10-01", metric: "2 hours" },
    { id: 3, category: "Health", activity: "Meditation", date: "2025-10-01", metric: "15 minutes" }
  ]

  const categories = [
    { name: "Fitness", color: "bg-primary", activities: 8, lastEntry: "Today" },
    { name: "Learning", color: "bg-secondary", activities: 15, lastEntry: "Yesterday" },
    { name: "Health", color: "bg-accent", activities: 6, lastEntry: "2 days ago" },
    { name: "Career", color: "bg-info", activities: 12, lastEntry: "3 days ago" }
  ]

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Level Up Dashboard</h1>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
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

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.username}! 👋</h2>
          <p className="text-base-content/70">Keep pushing your limits and tracking your progress.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-base-100 rounded-lg shadow-sm">
            <div className="stat-figure text-primary">
              <ChartBarIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Categories</div>
            <div className="stat-value text-primary">{stats.totalCategories}</div>
            <div className="stat-desc">Active tracking areas</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-sm">
            <div className="stat-figure text-secondary">
              <ArrowTrendingUpIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">This Week</div>
            <div className="stat-value text-secondary">{stats.weeklyActivities}</div>
            <div className="stat-desc">Activities completed</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-sm">
            <div className="stat-figure text-accent">
              <FireIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Current Streak</div>
            <div className="stat-value text-accent">{stats.currentStreak}</div>
            <div className="stat-desc">Days in a row</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-sm">
            <div className="stat-figure text-info">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Entries</div>
            <div className="stat-value text-info">{stats.totalEntries}</div>
            <div className="stat-desc">All time progress</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn btn-primary btn-sm">
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Entry
                </button>
                <button className="btn btn-secondary btn-sm">
                  <PlusIcon className="w-4 h-4 mr-1" />
                  New Activity
                </button>
                <button className="btn btn-accent btn-sm">
                  <PlusIcon className="w-4 h-4 mr-1" />
                  New Category
                </button>
                <button className="btn btn-outline btn-sm">
                  <ChartBarIcon className="w-4 h-4 mr-1" />
                  View Reports
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded">
                    <div>
                      <div className="font-medium">{activity.activity}</div>
                      <div className="text-sm text-base-content/70">
                        {activity.category} • {activity.metric}
                      </div>
                    </div>
                    <div className="text-xs text-base-content/50">
                      {activity.date === "2025-10-02" ? "Today" : activity.date}
                    </div>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm w-full">View All</button>
              </div>
            </div>
          </div>

          {/* Categories Overview */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map(category => (
                  <div key={category.name} className="flex items-center justify-between p-2 hover:bg-base-200 rounded cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-base-content/70">{category.activities} activities</div>
                      </div>
                    </div>
                    <div className="text-xs text-base-content/50">{category.lastEntry}</div>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm w-full">Manage Categories</button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart Placeholder */}
        <div className="mt-6">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Progress Overview</h3>
              <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
                <p className="text-base-content/50">Progress chart coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
