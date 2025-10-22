import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  startOfDay,
  differenceInDays,
  isSameDay as dateFnsIsSameDay,
  isToday,
  isYesterday,
  parse,
  formatDistanceToNow
} from 'date-fns'

export const formatDate = (date, formatStr = "MMM d, yyyy") => {
  if (!date) return ""

  let d
  if (typeof date === 'string') {
    const dateOnly = date.split('T')[0]
    d = parseLocalDate(dateOnly)
  } else {
    d = date
  }

  return format(d, formatStr)
}

export const formatRelativeDate = (dateString) => {
  if (!dateString) return "Never"

  const dateOnly = dateString.split('T')[0]

  const date = parse(dateOnly, 'yyyy-MM-dd', new Date())

  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return formatDistanceToNow(date, { addSuffix: true })
}

export const formatDateForInput = (date = new Date()) => {
  return format(date, 'yyyy-MM-dd')
}

export const parseLocalDate = (dateStr) => {
  return parse(dateStr, "yyyy-MM-dd", new Date())
}

export const getTodayLocal = () => {
  return formatDateForInput(new Date())
}

export const isSameDay = (date1, date2) => {
  const d1 = typeof date1 === "string" ? parseLocalDate(date1) : date1
  const d2 = typeof date2 === "string" ? parseLocalDate(date2) : date2
  return dateFnsIsSameDay(d1, d2)
}

export const getStartOfWeek = (date = new Date()) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  return formatDateForInput(weekStart)
}

export const getStartOfMonth = (date = new Date()) => {
  const monthStart = startOfMonth(date)
  return formatDateForInput(monthStart)
}

export const getDaysAgo = (days) => {
  const past = new Date()
  past.setDate(past.getDate() - days)
  return formatDateForInput(past)
}

export const isTodayStr = (dateStr) => {
  return dateStr === getTodayLocal()
}

export const formatCalendarDate = (date) => {
  return formatDate(date, "EEEE, MMMM d, yyyy")
}

export const getDateRange = (startDateStr, endDateStr) => {
  const start = parseLocalDate(startDateStr)
  const end = parseLocalDate(endDateStr)
  const dates = []
  const current = new Date(start)

  while (current <= end) {
    dates.push(formatDateForInput(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export const formatTime = (datetime) => {
  const dt = typeof datetime === 'string' ? parseISO(datetime) : datetime
  return format(dt, "h:mm a")
}

export const formatDateTime = (datetime) => {
  const dt = typeof datetime === 'string' ? parseISO(datetime) : datetime
  return format(dt, "MMMM d, yyyy \'at\' h:mm a")
}

export const getDaysBetween = (date1, date2) => {
  const d1 = typeof date1 === "string" ? parseLocalDate(date1) : date1
  const d2 = typeof date2 === "string" ? parseLocalDate(date2) : date2
  return Math.abs(differenceInDays(d1, d2))
}

export const isPast = (date) => {
  const d = typeof date === "string" ? parseLocalDate(date) : date
  const today = startOfDay(new Date())
  return d < today
}

export const isFuture = (date) => {
  const d = typeof date === "string" ? parseLocalDate(date) : date
  const today = startOfDay(new Date())
  return d > today
}
