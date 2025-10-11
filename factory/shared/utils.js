export function calculateStreak(dateRows) {
  if (dateRows.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const entryDates = dateRows.map(row => {
    const date = new Date(row.entry_date)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  })

  const todayTime = today.getTime()
  const yesterdayTime = yesterday.getTime()

  if (entryDates[0] !== todayTime && entryDates[0] !== yesterdayTime) {
    return 0
  }

  let streak = 1
  let expectedNext = entryDates[0] - (24 * 60 * 60 * 1000)

  for (let i = 1; i < entryDates.length; i++) {
    if (entryDates[i] === expectedNext) {
      streak++
      expectedNext -= (24 * 60 * 60 * 1000)
    } else {
      break
    }
  }

  return streak
}

export function calculateLongestStreak(dateRows) {
  if (dateRows.length === 0) return 0

  const entryDates = dateRows.map(row => {
    const date = new Date(row.entry_date)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  })

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < entryDates.length; i++) {
    const expectedPrevious = entryDates[i - 1] - (24 * 60 * 60 * 1000)

    if (entryDates[i] === expectedPrevious) {
      currentStreak++
    } else {
      longestStreak = Math.max(longestStreak, currentStreak)
      currentStreak = 1
    }
  }

  return Math.max(longestStreak, currentStreak)
}

export function formatRelativeDate(date) {
  const today = new Date()
  const entryDate = new Date(date)
  const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`

  return entryDate.toISOString().split("T")[0]
}
