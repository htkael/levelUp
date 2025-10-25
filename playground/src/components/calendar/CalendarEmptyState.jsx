import { FaCalendarTimes } from 'react-icons/fa'

export const CalendarEmptyState = ({
  hasFilters,
  onClearFilters,
  onCreateEntry
}) => {
  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body p-12">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center">
            <FaCalendarTimes className="w-10 h-10 text-base-content/40" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-base-content/80">
            No Entries Found
          </h3>

          {/* Description */}
          <p className="text-base-content/60 max-w-md">
            {hasFilters
              ? "No progress entries match your current filters for this month. Try adjusting your filters or create a new entry."
              : "You haven't logged any progress entries for this month yet. Start tracking your activities to see them appear here!"
            }
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            {hasFilters && (
              <button
                className="btn btn-ghost"
                onClick={onClearFilters}
              >
                Clear Filters
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={onCreateEntry}
            >
              Create Entry
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
