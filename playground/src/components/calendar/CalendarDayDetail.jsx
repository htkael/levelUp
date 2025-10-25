import { useState } from "react"
import { useCalendarDay } from "../../hooks/useCalendarDay"
import { LoadingSpinner } from "../shared/LoadingSpinner"
import { ProgressEntryModal } from "../progressEntries/ProgressEntryModal"
import { formatDate, formatRelativeDate } from "../../utils/dateHelpers"

export const CalendarDayDetail = ({ day, isOpen, onClose, onCreateEntry }) => {
  const { data: entries, isLoading, error } = useCalendarDay(day)
  const [selectedEntryId, setSelectedEntryId] = useState(null)

  if (!isOpen) {
    return null
  }

  if (isLoading) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
          <LoadingSpinner
            fullPage={true}
            text="Loading day details..."
          />
        </div>
        <div className="modal-backdrop" onClick={onClose}></div>
      </div>
    )
  }

  const hasEntries = entries && entries.length > 0

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {formatDate(day, "EEEE, MMMM d, yyyy")}
            </h2>
            <div className="text-base-content/60">
              {formatRelativeDate(day)} • {hasEntries ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}` : 'No entries'}
            </div>
          </div>

          {/* Empty State */}
          {!hasEntries && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No Entries Yet</h3>
              <p className="text-base-content/60 mb-6">
                You haven't logged any progress for this day.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onCreateEntry(day)
                  onClose()
                }}
              >
                Add Entry for This Day
              </button>
            </div>
          )}

          {/* Entries List */}
          {hasEntries && (
            <div className="space-y-6">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <div className="card-body p-4">
                    {/* Entry Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{entry.activityName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="badge badge-sm border-none"
                            style={{ backgroundColor: entry.categoryColor }}
                          >
                            {entry.categoryName}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm btn-circle"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEntryId(entry.id)
                        }}
                      >
                        →
                      </button>
                    </div>

                    {/* Metrics Grid */}
                    {entry.metrics && entry.metrics.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {entry.metrics.map((metric, index) => (
                          <div key={index} className="bg-base-300 rounded-lg p-3">
                            <div className="text-xs text-base-content/60 mb-1">
                              {metric.metricName}
                            </div>
                            <div className="text-lg font-bold">
                              {metric.metricType === "duration"
                                ? `${metric.value} ${metric.unit}`
                                : `${metric.value}${metric.unit}`
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notes Preview */}
                    {entry.notes && (
                      <div className="mt-3 p-3 bg-base-300 rounded-lg">
                        <div className="text-xs text-base-content/60 mb-1">Notes</div>
                        <p className="text-sm line-clamp-2">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Entry Button */}
              <button
                className="btn btn-outline btn-block"
                onClick={() => {
                  onCreateEntry(day)
                  onClose()
                }}
              >
                + Add Another Entry for This Day
              </button>
            </div>
          )}
        </div>
        <div className="modal-backdrop" onClick={onClose}></div>
      </div>

      {/* Progress Entry Detail Modal */}
      {selectedEntryId && (
        <ProgressEntryModal
          entryId={selectedEntryId}
          isOpen={!!selectedEntryId}
          onClose={() => setSelectedEntryId(null)}
        />
      )}
    </>
  )
}
