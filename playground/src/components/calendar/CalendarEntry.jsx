export const CalendarEntry = ({ entry, onClick }) => {
  return (
    <button
      className="w-full text-left px-1.5 py-0.5 rounded text-xs truncate hover:brightness-110 transition-all"
      style={{ backgroundColor: entry.categoryColor }}
      onClick={(e) => {
        e.stopPropagation()
        onClick(entry)
      }}
      title={entry.activityName}
    >
      <span className="font-medium text-white drop-shadow">
        {entry.activityName}
      </span>
    </button>
  )
}
