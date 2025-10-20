import { useState } from "react"
import { CreateMetricType } from "./CreateMetricType"
import { useToggleActivityMetric } from "../../hooks/mutations/useToggleActivityMetric"
import { useDeleteActivityMetric } from "../../hooks/mutations/useDeleteActivityMetric"

export const MetricCard = ({
  metric,
}) => {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)

  const { mutate: setPrimary, isPending: isTogglePending } = useToggleActivityMetric()
  const { mutate: deletMetric, isPending: isDeletePending } = useDeleteActivityMetric()

  const handleOpenUpdate = () => {
    setIsUpdateOpen(true)
  }

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false)
  }

  const handleSetPrimary = () => {
    setPrimary(metric)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the "${metric.metricName}" metric? This will also delete all progress data for this metric.`)) {
      deletMetric(metric)
    }
  }

  const isPrimary = metric?.isPrimary

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h4 className="font-semibold truncate">{metric.metricName}</h4>
            {isPrimary && (
              <div className="badge badge-primary badge-sm flex-shrink-0">Primary</div>
            )}
          </div>

          {/* Actions Dropdown */}
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Metric actions"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-4 h-4 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40"
            >
              <li>
                <button onClick={handleOpenUpdate}>Edit</button>
              </li>
              <li>
                <button onClick={handleSetPrimary} disabled={isTogglePending}>Set Primary</button>
              </li>
              <li>
                <button
                  className="text-error"
                  onClick={handleDelete}
                  disabled={isDeletePending}
                >
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Metric Stats */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/60">Average:</span>
            <span className="font-semibold">
              {metric.averageValue?.toFixed(1) || 0} {metric.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Min / Max:</span>
            <span className="font-semibold">
              {metric.minValue || 0} / {metric.maxValue || 0} {metric.unit}
            </span>
          </div>
          {metric.cumulativeValue !== null && metric.cumulativeValue !== undefined && (
            <div className="flex justify-between">
              <span className="text-base-content/60">Total:</span>
              <span className="font-semibold">
                {metric.cumulativeValue?.toFixed(1) || 0} {metric.unit}
              </span>
            </div>
          )}
        </div>

        {/* Metric Type Badge (Optional) */}
        <div className="mt-2">
          <div className="badge badge-ghost badge-sm">
            {metric.metricType}
          </div>
        </div>
      </div>
      <CreateMetricType
        isOpen={isUpdateOpen}
        onClose={handleCloseUpdate}
        initialData={metric}
        activityId={metric.activityId}
      />
    </div>
  )
}
