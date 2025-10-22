import { getCurrentDateInTimezone, getDaysAgoInTimezone } from "./timezone.js"

export function calculateStreak(dateRows, timezone) {
  if (dateRows.length === 0) return 0

  const today = getCurrentDateInTimezone(timezone)
  const yesterday = getDaysAgoInTimezone(1, timezone)

  const entryDates = dateRows.map(row => {
    return row.entryDate instanceof Date
      ? row.entryDate.toISOString().split('T')[0]
      : row.entryDate
  })

  if (entryDates[0] !== today && entryDates[0] !== yesterday) {
    return 0
  }

  let streak = 1
  let expectedNext = entryDates[0]

  for (let i = 1; i < entryDates.length; i++) {
    const prevDate = new Date(expectedNext)
    prevDate.setDate(prevDate.getDate() - 1)
    const expectedDate = prevDate.toISOString().split('T')[0]

    if (entryDates[i] === expectedDate) {
      streak++
      expectedNext = expectedDate
    } else {
      break
    }
  }

  return streak
}

export function calculateLongestStreak(dateRows) {
  if (dateRows.length === 0) return 0

  const entryDates = dateRows.map(row => {
    return row.entryDate instanceof Date
      ? row.entryDate.toISOString().split('T')[0]
      : row.entryDate
  })

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < entryDates.length; i++) {
    const currentDate = new Date(entryDates[i - 1])
    currentDate.setDate(currentDate.getDate() - 1)
    const expectedPrevious = currentDate.toISOString().split('T')[0]

    if (entryDates[i] === expectedPrevious) {
      currentStreak++
    } else {
      longestStreak = Math.max(longestStreak, currentStreak)
      currentStreak = 1
    }
  }

  return Math.max(longestStreak, currentStreak)
}
