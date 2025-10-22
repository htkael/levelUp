function getCurrentDateInTimezone(timezone) {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: "numeric",
    month: '2-digit',
    day: "2-digit"
  })

  return formatter.format(now)
}

function getStartOfWeekInTimezone(timezone) {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: "numeric",
    month: '2-digit',
    day: "2-digit",
    weekday: "long"
  })

  const parts = formatter.formatToParts(now)
  const dateStr = `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`
  const date = new Date(dateStr + "T00:00:00")
  const dayOfWeek = date.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  date.setDate(date.getDate() - diff)
  return date.toISOString().split('T')[0]
}
