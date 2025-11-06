import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import {
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline"
import { StatCard } from "../components/shared/StatCard"
import { useDashboard } from "../hooks/useDashboard"
import { QuickActions } from "../components/dashboard/QuickActions"
import { RecentActivities } from "../components/dashboard/RecentActivities"
import { Categories } from "../components/dashboard/Categories"

export const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const { data, isLoading, isError, error } = useDashboard()

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="min-h-screen bg-base-200">
          <div className="container mx-auto px-4 py-6">
            <div className="mb-8">
              <div className="skeleton h-8 w-64 mb-2"></div>
              <div className="skeleton h-4 w-96"></div>
            </div>

            {/* Loading skeleton for stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card bg-base-100 shadow-sm">
                  <div className="card-body">
                    <div className="skeleton h-4 w-20 mb-2"></div>
                    <div className="skeleton h-8 w-16 mb-2"></div>
                    <div className="skeleton h-3 w-32"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading skeleton for main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card bg-base-100 shadow-sm">
                  <div className="card-body">
                    <div className="skeleton h-6 w-32 mb-4"></div>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="skeleton h-12 w-full"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="alert alert-error max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">Error loading dashboard</h3>
                <div className="text-xs">{error.message || 'Failed to load dashboard data'}</div>
              </div>
            </div>
            <button
              className="btn btn-primary mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const stats = data?.stats || {}
  const recentActivities = data?.recentActivities || []
  const categories = data?.categories || []

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-screen bg-base-200">
        {/* Header */}
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
            <QuickActions />

            {/* Recent Activity */}
            <RecentActivities recentActivities={recentActivities} />

            {/* Categories Overview */}
            <Categories categories={categories} />
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
    </div>
  )
}
