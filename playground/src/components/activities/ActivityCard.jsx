import { Link } from "react-router-dom"
import { formatRelativeDate } from "../../utils/dateHelpers"
import { useDeleteActivity } from "../../hooks/mutations/useDeleteActivity"
import { useState } from "react"
import { UpdateActivity } from "./UpdateActivity.jsx"
import { useToggleActivity } from "../../hooks/mutations/useToggleActivity.js"

export const ActivityCard = ({ activity }) => {
  const [updateOpen, setUpdateOpen] = useState(false)
  const { mutate: deleteActivity, isPending: isDeletePending } = useDeleteActivity()
  const { mutate: toggleActivity, isPending: isTogglePending } = useToggleActivity()

  const isDeleting = isDeletePending
  const isToggling = isTogglePending

  const handleToggleActivity = () => {
    toggleActivity(activity)
  }


  const handleDeleteActivity = () => {
    if (window.confirm(`Are you sure you want to delete "${activity.name}"? This will also delete all progress entries for this activity.`)) {
      deleteActivity(activity)
    }
  }

  const handleCloseUpdate = () => {
    setUpdateOpen(false)
  }

  return (
    <div className={`card bg-base-200 shadow-sm hover:shadow-md transition-shadow ${!activity.isActive ? 'opacity-60' : ''}`}>
      <div className="card-body">
        {/* Header: Name, Status Badge, Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="card-title text-lg truncate">{activity.name}</h3>
              {!activity.isActive && (
                <div className="badge badge-ghost badge-sm">Hidden</div>
              )}
            </div>

            {/* Category Badge */}
            <Link
              to={`/categories/${activity.categoryId}`}
              className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: activity.categoryColor }}
              ></div>
              <span className="text-base-content/70">{activity.categoryName}</span>
            </Link>
          </div>

          {/* Actions Dropdown */}
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-sm btn-circle"
              disabled={isDeleting || isToggling}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
              <li>
                <Link to={`/activities/${activity.id}`}>
                  View Details
                </Link>
              </li>
              <li>
                <button onClick={() => setUpdateOpen(true)}>Edit</button>
              </li>
              <li>
                <button
                  onClick={handleToggleActivity}
                  disabled={isToggling}
                >
                  {isToggling ? "..." : activity.isActive ? "Hide Activity" : "Unhide Activity"}
                </button>
              </li>
              <li>
                <button
                  className="text-error"
                  onClick={handleDeleteActivity}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-base-content/70 mt-2 line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Primary Metric Display */}
        {activity.primaryMetricName && activity.primaryMetricLastValue && (
          <div className="mt-3 p-3 bg-base-300 rounded-lg">
            <div className="text-xs text-base-content/60 mb-1">Latest {activity.primaryMetricName}</div>
            <div className="text-2xl font-bold text-primary">{activity.primaryMetricLastValue}</div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div>
            <span className="text-base-content/60">Entries: </span>
            <span className="font-semibold">{activity.totalEntries || 0}</span>
          </div>
          <div>
            <span className="text-base-content/60">Metrics: </span>
            <span className="font-semibold">{activity.metricCount || 0}</span>
          </div>
          <div className="col-span-2">
            <span className="text-base-content/60">Last entry: </span>
            <span className="font-semibold">{formatRelativeDate(activity.lastEntryDate)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions justify-end mt-4 gap-2">
          <button className="btn btn-primary btn-sm">
            Log Progress
          </button>
          <Link
            to={`/activities/${activity.id}`}
            className="btn btn-ghost btn-sm"
          >
            Details →
          </Link>
        </div>
      </div>
      <UpdateActivity
        isOpen={updateOpen}
        onClose={handleCloseUpdate}
        activity={activity}
      />
    </div>
  )
}
