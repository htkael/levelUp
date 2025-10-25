import { useState } from "react"
import { useCalendar } from "../hooks/useCalendar"
import { LoadingSpinner } from "../components/shared/LoadingSpinner.jsx"
import {
  getMonthLocal,
  incrementMonth,
  decrementMonth,
  formatMonthYear,
  getTodayLocal
} from "../utils/dateHelpers.js"
import { CalendarDay } from "../components/calendar/CalendarDay.jsx"
import { FilterDropdown } from "../components/calendar/CalendarFilter.jsx"
import { FaRunning, FaFolder } from "react-icons/fa"
import { useActivities } from "../hooks/useActivities.js"
import { useCategories } from "../hooks/useCategories.js"
import { ProgressEntryModal } from "../components/progressEntries/ProgressEntryModal.jsx"
import { createPortal } from "react-dom"

export const Calendar = () => {
  const startMonth = getMonthLocal()
  const [month, setMonth] = useState(startMonth)
  const [activityId, setActivityId] = useState(null)
  const [categoryId, setCategoryId] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)

  const { data, isLoading } = useCalendar({ activityId, categoryId, month })
  const { data: activityData, isLoading: isActivityLoading } = useActivities({})
  const { data: categoryData, isLoading: isCategoryLoading } = useCategories()

  const activityOptions = isActivityLoading ? [{ label: "Loading...", value: null }] : activityData.filter((a) => {
    if (categoryId) {
      return a.categoryId === categoryId
    }
    return a
  }).map((a) => {
    return {
      value: a.id,
      name: a.name,
      color: a.categoryColor
    }
  })

  const categoryOptions = isCategoryLoading ? [{ label: "Loading...", value: null }] : categoryData.map((c) => {
    return {
      value: c.id,
      name: c.name,
      color: c.color
    }
  })

  const handleCategoryChange = (id) => {
    if (activityId) {
      const selectedActivity = activityData.find(a => a.id === activityId)
      if (selectedActivity.categoryId !== id) {
        setActivityId(null)
      }
      setCategoryId(id)
      return
    } else {
      setCategoryId(id)
    }
  }

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry.id)
  }

  const handleIncrementMonth = () => {
    setMonth(prev => incrementMonth(prev))
  }

  const handleDecrementMonth = () => {
    setMonth(prev => decrementMonth(prev))
  }

  const handleToday = () => {
    setMonth(getMonthLocal())
  }

  const generateCalendarDays = () => {
    const [year, monthNum] = month.split('-').map(Number)
    const firstDay = new Date(year, monthNum - 1, 1)
    const lastDay = new Date(year, monthNum, 0)

    let startDayOfWeek = firstDay.getDay() - 1
    if (startDayOfWeek === -1) startDayOfWeek = 6

    const daysInMonth = lastDay.getDate()

    const days = []

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ isEmpty: true, key: `empty-start-${i}` })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        date: dateStr,
        dayNumber: day,
        entries: data?.[dateStr] || [],
        isToday: dateStr === getTodayLocal(),
        key: dateStr
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  if (isLoading) {
    return (
      <LoadingSpinner
        fullPage={true}
        text="Loading calendar.."
      />
    )
  }

  return (
    <div className="p-6">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Progress Calendar</h1>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDecrementMonth}
          >
            ← Previous
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleToday}
          >
            Today
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleIncrementMonth}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Current Month Display */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">{formatMonthYear(month)}</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <FilterDropdown
          label="Activity"
          icon={FaRunning}
          options={activityOptions}
          value={activityId}
          onChange={setActivityId}
          placeholder="All Activities"
        />
        <FilterDropdown
          label="Category"
          icon={FaFolder}
          options={categoryOptions}
          value={categoryId}
          onChange={handleCategoryChange}
          placeholder="All Categories"
        />
      </div>

      {/* Calendar Grid */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-base-content/70 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(day => (
              <CalendarDay
                key={day.key}
                day={day}
                onClick={(data) => { console.log("Clicked day", data) }}
                onEntryClick={handleEntryClick}
              />
            ))}
          </div>
        </div>
      </div>
      {selectedEntry && createPortal(
        <ProgressEntryModal
          isOpen={selectedEntry}
          entryId={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />,
        document.body
      )}
    </div>
  )
}
