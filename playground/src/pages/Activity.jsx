import { Link, useParams } from "react-router-dom"
import { StatCard } from "../components/shared/StatCard.jsx"
import { ErrorAlert } from "../components/shared/errors/ErrorAlert.jsx"
import { formatRelativeDate } from "../utils/dateHelpers.js"
import { FireIcon } from "@heroicons/react/24/outline"
import { useActivityBasic } from "../hooks/useActivityBasic.js"
import { useActivityStats } from "../hooks/useActivityStats.js"
import { useDeleteActivity } from "../hooks/mutations/useDeleteActivity.js"
import { useToggleActivity } from "../hooks/mutations/useToggleActivity.js"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { UpdateActivity } from "../components/activities/UpdateActivity.jsx"
import { GoalCard } from "../components/shared/GoalCard.jsx"
import { ProgressEntryCard } from "../components/shared/ProgressEntryCard.jsx"

export const Activity = () => {
  const { id } = useParams()
  const [updateOpen, setUpdateOpen] = useState(false)

  const { data: activity, isLoading, error } = useActivityBasic(id)
  const { data: stats, isLoading: statsLoading } = useActivityStats(id)
  const { mutate: deleteActivity, isPending: isDeletePending } = useDeleteActivity()
  const { mutate: toggleActivity, isPending: isTogglePending } = useToggleActivity()
  const navigate = useNavigate()

  const handleToggleActivity = () => {
    toggleActivity(activity)
  }

  const handleDeleteActivity = () => {
    if (window.confirm(`Are you sure you want to delete "${activity.name}"? This will also delete all progress entries for this activity.`)) {
      deleteActivity(activity, {
        onSuccess: () => {
          navigate("/activities")
        }
      })
    }
  }

  const handleUpdateActivity = () => {
    setUpdateOpen(true)
  }

  const handleCloseUpdate = () => {
    setUpdateOpen(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-12 w-64"></div>
        <div className="skeleton h-32 w-full"></div>
      </div>
    )
  }

  if (error) {
    return <ErrorAlert error={error} title="Failed to load activity" />
  }

  const primaryMetric = activity.metrics?.find(m => m.isPrimary)

  return (
    <div className="space-y-6 m-6">
      {/* Header with Breadcrumb */}
      <div>
        <div className="text-sm breadcrumbs mb-2">
          <ul>
            <li><Link to="/activities">Activities</Link></li>
            <li>{activity.name}</li>
          </ul>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{activity.name}</h1>
              {!activity.isActive && (
                <div className="badge badge-ghost">Hidden</div>
              )}
            </div>
            {activity.description && (
              <p className="text-base-content/70 mb-2">{activity.description}</p>
            )}
            <Link
              to={`/categories/${activity.categoryId}`}
              className="text-sm text-primary hover:underline"
            >
              {stats?.overview?.categoryName}
            </Link>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={handleUpdateActivity}> Edit</button>
            <button className="btn btn-ghost btn-sm" onClick={handleToggleActivity} disabled={isTogglePending}>
              {activity.isActive ? "Hide" : "Unhide"}
            </button>
            <button className="btn btn-error btn-sm" onClick={handleDeleteActivity} disabled={isDeletePending}>Delete</button>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full gap-4 shadow-none">
        <StatCard
          name="Total Entries"
          value={statsLoading ? <span className="loading loading-spinner loading-md"></span> : stats?.overview?.totalEntries || 0}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
          subtitle={`${stats?.timeBased?.averagePerWeek || 0} per week avg`}
          bg="bg-base-200"
        />

        <StatCard
          name="Current Streak"
          value={statsLoading ? <span className="loading loading-spinner loading-md"></span> : `${stats?.consistency?.currentStreak || 0}`}
          icon={<FireIcon className="w-8 h-8" />}
          subtitle={`Longest: ${stats?.consistency?.longestStreak || 0} days`}
          bg="bg-base-200"
        />

        <StatCard
          name="Last Entry"
          value={statsLoading ? <span className="loading loading-spinner loading-md"></span> : formatRelativeDate(stats?.overview?.lastEntry)}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          subtitle={`${stats?.consistency?.totalDaysLogged || 0} days logged`}
          bg="bg-base-200"
        />

        {primaryMetric && (
          <StatCard
            name={`Avg ${primaryMetric.metricName}`}
            value={statsLoading ? <span className="loading loading-spinner loading-md"></span> : stats?.metrics?.find(m => m.metricName === primaryMetric.metricName)?.averageValue?.toFixed(1) || 0}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>}
            subtitle={primaryMetric.unit}
            bg="bg-base-200"
          />
        )}
      </div>

      {/* Metrics Overview */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title">Metrics</h3>
            <button className="btn btn-primary btn-sm">
              <span className="text-lg">+</span>
              Add Metric
            </button>
          </div>

          {statsLoading ? (
            <div className="space-y-3">
              <div className="skeleton h-20 w-full"></div>
              <div className="skeleton h-20 w-full"></div>
            </div>
          ) : stats?.metrics && stats.metrics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.metrics.map((metric) => (
                <div key={metric.metricId} className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{metric.metricName}</h4>
                      {activity.metrics?.find(m => m.metricName === metric.metricName)?.isPrimary && (
                        <div className="badge badge-primary badge-sm">Primary</div>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Average:</span>
                        <span className="font-semibold">{metric.averageValue?.toFixed(1)} {metric.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Min / Max:</span>
                        <span className="font-semibold">{metric.minValue} / {metric.maxValue} {metric.unit}</span>
                      </div>
                      {metric.cumulativeValue && (
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Total:</span>
                          <span className="font-semibold">{metric.cumulativeValue?.toFixed(1)} {metric.unit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/60">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="text-lg mb-2">No metrics yet</p>
              <p className="text-sm">Add metrics to track different aspects of this activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {
        statsLoading ? (
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <div className="skeleton h-6 w-48 mb-4"></div>
              <div className="space-y-3">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
              </div>
            </div>
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time-based Stats */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">This week</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.timeBased.thisWeekEntries} entries</span>
                      {stats.timeBased.weekOverWeek !== 0 && (
                        <span className={`text-sm ${stats.timeBased.weekOverWeek > 0 ? 'text-success' : 'text-error'}`}>
                          {stats.timeBased.weekOverWeek > 0 ? '↑' : '↓'} {Math.abs(stats.timeBased.weekOverWeek)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">This month</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.timeBased.thisMonthEntries} entries</span>
                      {stats.timeBased.monthOverMonth !== 0 && (
                        <span className={`text-sm ${stats.timeBased.monthOverMonth > 0 ? 'text-success' : 'text-error'}`}>
                          {stats.timeBased.monthOverMonth > 0 ? '↑' : '↓'} {Math.abs(stats.timeBased.monthOverMonth)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">Weekly average</span>
                    <span className="font-semibold">{stats.timeBased.averagePerWeek}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consistency Stats */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Consistency</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">Current streak</span>
                    <span className="font-semibold">{stats.consistency.currentStreak} days 🔥</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">Longest streak</span>
                    <span className="font-semibold">{stats.consistency.longestStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">Engagement rate</span>
                    <span className="font-semibold">{stats.consistency.engagementRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">Days since first</span>
                    <span className="font-semibold">{stats.consistency.daysSinceFirst} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Active Goals */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title">Active Goals</h3>
            <button className="btn btn-primary btn-sm">
              <span className="text-lg">+</span>
              Create Goal
            </button>
          </div>
          {statsLoading ? (
            <div className="space-y-3">
              <div className="skeleton h-24 w-full"></div>
              <div className="skeleton h-24 w-full"></div>
            </div>
          ) : stats?.goals && stats.goals.length > 0 ? (
            <div className="space-y-4">
              {stats.goals.map((goal, index) => (
                <GoalCard
                  goal={goal}
                  key={goal.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/60">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
              </svg>
              <p className="text-lg mb-2">No active goals</p>
              <p className="text-sm">Create a goal to track your progress towards a specific target</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title">Recent Entries</h3>
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm">
                <span className="text-lg">+</span>
                Log Progress
              </button>
              <Link to={`/progress/calendar?activity=${id}`} className="btn btn-ghost btn-sm">
                View All →
              </Link>
            </div>
          </div>

          {statsLoading ? (
            <div className="space-y-3">
              <div className="skeleton h-24 w-full"></div>
              <div className="skeleton h-24 w-full"></div>
            </div>
          ) : stats?.recentEntries && stats.recentEntries.length > 0 ? (
            <div className="space-y-3">
              {stats.recentEntries.map((entry) => (
                <ProgressEntryCard
                  entry={entry}
                  key={entry.id}
                  onEdit={() => console.log("edit")}
                  onDelete={() => console.log("delete")}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-base-content/60">
              <p>No entries yet. Log your first progress!</p>
            </div>
          )}
        </div>
      </div>
      <UpdateActivity
        isOpen={updateOpen}
        onClose={handleCloseUpdate}
        activity={activity}
      />
    </div >
  )
}
