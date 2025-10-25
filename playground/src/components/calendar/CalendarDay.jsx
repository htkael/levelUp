import { getTodayLocal } from "../../utils/dateHelpers"
import { CalendarEntry } from "./CalendarEntry"

export const CalendarDay = ({ day, onClick, onEntryClick }) => {
  if (day.isEmpty) {
    return <div className="aspect-square" />
  }

  const today = getTodayLocal()
  const isToday = day.date === today
  const hasEntries = day.entries.length > 0
  const maxEntriesToShow = 5
  const visibleEntries = day.entries.slice(0, maxEntriesToShow)
  const remainingCount = day.entries.length - maxEntriesToShow

  return (
    <div
      className={`
        aspect-square p-2 rounded-lg border-2 cursor-pointer
        transition-all hover:border-primary
        ${isToday
          ? 'border-primary bg-primary/10'
          : 'border-base-300 bg-base-100'
        }
        ${hasEntries
          ? 'ring-2 ring-success ring-opacity-50'
          : ''
        }
      `}
      onClick={() => onClick(day)}
    >
      {/* Day Number and Entry Count */}
      <div className="flex items-center justify-between mb-1">
        <div className={`
          text-sm font-semibold
          ${isToday ? 'text-primary' : 'text-base-content'}
        `}>
          {day.dayNumber}
        </div>

        {hasEntries && (
          <div className="text-xs text-success font-semibold">
            {day.entries.length > 1 ? `${day.entries.length} entries` : `${day.entries.length} entry`}
          </div>
        )}
      </div>

      {/* Entry List */}
      {hasEntries && (
        <div className="flex flex-col gap-1">
          {visibleEntries.map((entry) => (
            <CalendarEntry
              key={entry.id}
              entry={entry}
              onClick={onEntryClick}
            />
          ))}

          {remainingCount > 0 && (
            <div className="text-xs text-base-content/60 text-center pt-0.5">
              +{remainingCount} more
            </div>
          )}
        </div>
      )}
    </div>
  )
}
