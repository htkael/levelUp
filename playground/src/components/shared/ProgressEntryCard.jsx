import { Link } from "react-router-dom"
import { formatDate } from "../../utils/dateHelpers"

export const ProgressEntryCard = ({
  entry,
  showActivity = false,
  onEdit,
  onDelete
}) => {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {/* Date */}
            <div className="font-semibold">
              {formatDate(entry.entryDate, 'EEE, MMM d, yyyy')}
            </div>

            {/* Activity Name (if showing) */}
            {showActivity && entry.activityName && (
              <p className="text-sm text-base-content/60 mt-1">{entry.activityName}</p>
            )}

            {/* Notes */}
            {entry.notes && (
              <p className="text-sm text-base-content/70 mt-1">{entry.notes}</p>
            )}
          </div>

          {/* Actions Dropdown */}
          {(onEdit || onDelete || entry.id) && (
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40">
                {entry.id && (
                  <li>
                    <Link to={`/progress/${entry.id}`}>View</Link>
                  </li>
                )}
                {onEdit && (
                  <li>
                    <button onClick={() => onEdit(entry)}>Edit</button>
                  </li>
                )}
                {onDelete && (
                  <li>
                    <button className="text-error" onClick={() => onDelete(entry)}>Delete</button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Metrics Display */}
        {entry.metrics && entry.metrics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.metrics.map((metric, idx) => (
              <div key={idx} className="badge badge-lg badge-outline">
                <span className="font-semibold mr-1">{metric.metricName}:</span>
                {metric.value} {metric.unit}
              </div>
            ))}
          </div>
        )}

        {/* Optional: Direct view link if no dropdown */}
        {!onEdit && !onDelete && entry.id && (
          <div className="card-actions justify-end mt-2">
            <Link to={`/progress/${entry.id}`} className="btn btn-ghost btn-xs">
              View →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
