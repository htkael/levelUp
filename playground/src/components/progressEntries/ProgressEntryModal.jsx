import { useGetProgressEntry } from "../../hooks/useGetProgressEntry"
import { LoadingSpinner } from "../shared/LoadingSpinner"
import { formatDate, formatRelativeDate } from "../../utils/dateHelpers"
import { useState } from "react"
import { CreateProgressEntry } from "./CreateProgressEntry.jsx"
import { useDeleteProgressEntry } from "../../hooks/mutations/useDeleteProgressEntry.js"

export const ProgressEntryModal = ({ entryId, isOpen, onClose }) => {
  const { data: entry, isLoading } = useGetProgressEntry(entryId)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const { mutate: deleteProgressEntry, isPending } = useDeleteProgressEntry()

  const handleOpenUpdate = () => {
    setIsUpdateOpen(true)
  }

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false)
  }

  const handleDeleteProgressEntry = () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      deleteProgressEntry(entry, {
        onSuccess: () => {
          onClose()
        }
      })
    }
  }

  const dataForEdit = {
    id: entry?.id,
    activityId: entry?.activityId,
    entryDate: entry?.entryDate.split("T")[0],
    notes: entry?.notes,
    metrics: entry?.metrics
  }

  if (!isOpen) {
    return null
  }

  if (isLoading) {
    return (
      <div className="modal modal-open">
        <div className={`modal-box max-w-4xl max-h-[90vh] overflow-y-auto`}>
          <LoadingSpinner
            fullPage={true}
            text="Loading Progress entry"
          />
        </div>
        <div className="modal-backdrop" onClick={onClose}></div>
      </div>
    )
  }

  return (
    <div className="modal modal-open">
      <div className={`modal-box max-w-4xl max-h-[90vh] overflow-y-auto`}>
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{entry?.activityName}</h2>
          <div className="flex items-center gap-3">
            <div className="badge badge-lg border-none" style={{ backgroundColor: entry?.categoryColor }}>
              {entry?.categoryName}
            </div>
            <span className="text-base-content/60">
              {formatRelativeDate(entry?.entryDate)}
            </span>
          </div>
        </div>

        {/* Date Information */}
        <div className="mb-6">
          <div className="text-sm text-base-content/60">Entry Date</div>
          <div className="text-lg font-semibold">{formatDate(entry?.entryDate, "EEEE, MMMM d, yyyy")}</div>
        </div>

        {/* Metrics Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entry?.metrics.map((metric, index) => (
              <div key={index} className="card bg-base-300 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-sm text-base-content/60">{metric.metricName}</div>
                  <div className="text-2xl font-bold">
                    {metric.metricType === "duration"
                      ? `${metric.value} ${metric.unit}`
                      : `${metric.value} ${metric.unit}`
                    }
                  </div>
                  <div className="text-xs text-base-content/50 capitalize">{metric.metricType}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        {entry?.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <div className="p-4 bg-base-300 rounded-lg">
              <p className="whitespace-pre-wrap">{entry.notes}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4 border-t border-base-300">
          <button
            type="button"
            className="btn btn-error btn-outline"
            onClick={handleDeleteProgressEntry}
          >
            Delete Entry
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenUpdate}
          >
            Edit Entry
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
      {entry?.id && isUpdateOpen && (
        <CreateProgressEntry
          isOpen={isUpdateOpen}
          onClose={handleCloseUpdate}
          activityId={entry.activityId}
          initialData={dataForEdit}
        />
      )}
    </div>
  )
}






