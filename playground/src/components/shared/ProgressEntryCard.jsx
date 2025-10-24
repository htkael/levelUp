import { formatDate } from "../../utils/dateHelpers"
import { ProgressEntryModal } from "../progressEntries/ProgressEntryModal.jsx"
import { useState } from "react"
import { createPortal } from 'react-dom'

export const ProgressEntryCard = ({
  entry,
  showActivity = false,
}) => {
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false)

  const handleCardClick = () => {
    if (entry?.id) {
      setIsEntryModalOpen(true)
    }
  }

  return (
    <>
      <div
        className="card bg-base-100 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] hover:bg-base-200 transition-all duration-200"
        onClick={handleCardClick}
      >
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
          </div>
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
        </div>
      </div>
      {entry?.id && isEntryModalOpen && createPortal(
        <ProgressEntryModal
          isOpen={isEntryModalOpen}
          onClose={() => setIsEntryModalOpen(false)}
          entryId={entry.id}
        />,
        document.body
      )}
    </>
  )
}
