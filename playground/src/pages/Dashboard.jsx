import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import {
  PlusIcon,
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline"
import { StatCard } from "../components/shared/StatCard"
import { Header } from "../components/shared/Header"

export const Dashboard = () => {
  const { user } = useContext(AuthContext)

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || user.username}! 👋</h2>
          <p className="text-base-content/70">Keep pushing your limits and tracking your progress.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard name="Categories" value={stats.totalCategories} subtitle="Active tracking areas" icon={<ChartBarIcon className="w-8 h-8" />} />
          <StatCard name="This Week" value={stats.weeklyActivities} subtitle="Activities Completed" icon={<ArrowTrendingUpIcon className="w-8 h-8" />} />
          <StatCard name="Current Streak" value={stats.currentStreak} subtitle="Days in a row" icon={<FireIcon className="w-8 h-8" />} />
          <StatCard name="Total Entries" value={stats.totalEntries} subtitle="All time progress" icon={<TrophyIcon className="w-8 h-8" />} />
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
