import { Link, useNavigate, useParams } from "react-router-dom"
import { StatCard } from "../components/shared/StatCard"
import { formatRelativeDate } from "../utils/dateHelpers"
import { FireIcon } from "@heroicons/react/24/outline"
import { useCategoryBasic } from "../hooks/useCategoryBasic"
import { useCategoryStats } from "../hooks/useCategoryStats"
import { LoadingSpinner } from "../components/shared/LoadingSpinner.jsx"
import { useDeleteCategory } from "../hooks/mutations/useDeleteCategory.js"
import { useState } from "react"
import { UpdateCategory } from "../components/categories/UpdateCategory.jsx"
import { CreateActivity } from "../components/activities/CreateActivity.jsx"


export const Category = () => {
  const { id } = useParams()
  const { data: category, isLoading: isBasicLoading, isError: isBasicError, error: basicError } = useCategoryBasic(id)
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError, error: statsError } = useCategoryStats(id)
  const { mutate: deleteCategory, isPending } = useDeleteCategory()
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [addActivity, setAddActivity] = useState(false)

  const navigate = useNavigate()

  const handleDeleteCategory = () => {
    if (window.confirm(`Are you sure you want to delete "${category?.name}"? This will also delete all activities and progress in this category.`)) {
      deleteCategory(id, {
        onSuccess: () => {
          navigate("/categories")
        }
      })
    }
  }

  const handleUpdateCategory = () => {
    setIsUpdateOpen(true)
  }

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false)
  }

  const handleCloseAdd = () => {
    setAddActivity(false)
  }

  const isLoading = isBasicLoading
  const statsLoading = isStatsLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-12 w-64"></div>
        <div className="skeleton h-32 w-full"></div>
      </div>
    )
  }

  if (isBasicError) {
    return <ErrorAlert error={basicError} title="Failed to load category" />
  }

  if (!category) {
    return <LoadingSpinner />
  }

  const activeActivities = category.activities?.filter(a => a.isActive) || []
  const inactiveActivities = category.activities?.filter(a => !a.isActive) || []


  return (
    <div className="space-y-6 m-6">
      {/* Header with Breadcrumb */}
      <div>
        <div className="text-sm breadcrumbs mb-2">
          <ul>
            <li><Link to="/categories">Categories</Link></li>
            <li>{category.name}</li>
          </ul>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-8 h-8 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            ></div>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-base-content/70 mt-1">{category.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={handleUpdateCategory}>Edit</button>
            <button
              tabIndex={0}
              className="btn btn-error btn-sm "
              disabled={isPending}
              onClick={handleDeleteCategory}
            >Delete
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full gap-4 shadow-none">
        <StatCard
          name="Total Activities"
          value={category.activities?.length || 0}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>}
          subtitle={`${activeActivities.length} active, ${inactiveActivities.length} hidden`}
          bg="bg-base-200"
        />

        <StatCard
          name="Total Entries"
          value={statsLoading ? <span className="loading loading-spinner loading-md"></span> : stats?.overview?.totalEntries || 0}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
          subtitle={`${stats?.averagePerWeek || 0} per week avg`}
          bg="bg-base-200"
        />

        <StatCard
          name="Current Streak"
          value={statsLoading ? <span className="loading loading-spinner loading-md"></span> : `${stats?.streak || 0}`}
          icon={<FireIcon className="w-8 h-8" />}
          subtitle="Keep it up!"
          bg="bg-base-200"
        />

        <StatCard
          name="Last Entry"
          value={statsLoading ? <span className="loading loading-spinner loading-md"></span> : formatRelativeDate(stats?.overview?.lastEntry)}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          subtitle={`${stats?.totalDaysLogged || 0} days logged`}
          bg="bg-base-200"
        />
      </div>

      {/* Detailed Stats Section */}
      {statsLoading ? (
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <div className="skeleton h-6 w-48 mb-4"></div>
            <div className="space-y-3">
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-3/4"></div>
            </div>
          </div>
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Breakdown */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">Activity Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Most tracked</span>
                  <span className="font-semibold">
                    {stats.mostTrackedActivity?.name || "N/A"} ({stats.mostTrackedActivity?.mostEntries || 0} entries)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Last logged</span>
                  <Link
                    to={`/activities/${stats.lastLoggedActivity?.id}`}
                    className="font-semibold hover:text-primary"
                  >
                    {stats.lastLoggedActivity?.name || "No entries logged"}
                  </Link>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Active activities</span>
                  <span className="font-semibold">{stats.activityCounts?.activeCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Hidden activities</span>
                  <span className="font-semibold">{stats.activityCounts?.inactiveCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time-based Stats */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">This week</span>
                  <span className="font-semibold">{stats.weeklyEntries || 0} entries</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">This month</span>
                  <span className="font-semibold">{stats.monthlyEntries || 0} entries</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Weekly average</span>
                  <span className="font-semibold">{stats.averagePerWeek || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Engagement rate</span>
                  <span className="font-semibold">{stats.engagementRate || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="card bg-base-200 shadow-sm lg:col-span-2">
            <div className="card-body">
              <h3 className="card-title mb-4">Tracking History</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="text-base-content/70 text-sm block mb-1">First Entry</span>
                  <p className="font-semibold text-lg">{formatRelativeDate(stats.overview?.firstEntry)}</p>
                </div>
                <div>
                  <span className="text-base-content/70 text-sm block mb-1">Last Entry</span>
                  <p className="font-semibold text-lg">{formatRelativeDate(stats.overview?.lastEntry)}</p>
                </div>
                <div>
                  <span className="text-base-content/70 text-sm block mb-1">Total Days Logged</span>
                  <p className="font-semibold text-lg">{stats.totalDaysLogged || 0} days</p>
                </div>
                <div>
                  <span className="text-base-content/70 text-sm block mb-1">Current Streak</span>
                  <p className="font-semibold text-lg">{stats.streak || 0} days 🔥</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activities in this Category */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title">Activities in {category.name}</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setAddActivity(true) }}>
              <span className="text-lg">+</span>
              Add Activity
            </button>
          </div>

          {/* Active Activities */}
          {activeActivities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-base-content/70 mb-2">Active Activities</h4>
              {activeActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-base-100 rounded-lg hover:bg-base-300 transition-colors">
                  <div>
                    <p className="font-semibold">{activity.name}</p>
                    {activity.description && (
                      <p className="text-sm text-base-content/70">{activity.description}</p>
                    )}
                  </div>
                  <Link to={`/activities/${index + 1}`} className="btn btn-ghost btn-sm">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Inactive Activities */}
          {inactiveActivities.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-semibold text-sm text-base-content/70 mb-2">Hidden Activities</h4>
              {inactiveActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-base-100 rounded-lg opacity-60 hover:opacity-100 transition-opacity">
                  <div>
                    <p className="font-semibold">{activity.name}</p>
                    {activity.description && (
                      <p className="text-sm text-base-content/70">{activity.description}</p>
                    )}
                  </div>
                  <Link to={`/activities/${index + 1}`} className="btn btn-ghost btn-sm">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {activeActivities.length === 0 && inactiveActivities.length === 0 && (
            <div className="text-center py-8 text-base-content/60">
              <p>No activities yet. Create one to start tracking!</p>
            </div>
          )}
        </div>
      </div>
      <UpdateCategory
        category={category}
        onClose={handleCloseUpdate}
        isOpen={isUpdateOpen}
      />
      <CreateActivity
        isOpen={addActivity}
        onClose={handleCloseAdd}
        catId={id}
      />
    </div>
  )
}
