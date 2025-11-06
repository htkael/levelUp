import { addDays, addMonths, addQuarters, addWeeks, addYears, differenceInDays, format, parse, parseISO, startOfDay, startOfMonth, startOfWeek } from "date-fns"
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz"

export function getCurrentDateInTimezone(timezone) {
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd")
}

export function getStartOfWeekInTimezone(timezone) {
  const now = new Date()
  const zonedNow = toZonedTime(now, timezone)
  const weekStart = startOfWeek(zonedNow, { weekStartsOn: 1 })
  return format(weekStart, "yyyy-MM-dd")
}

export function getStartOfMonthInTimezone(timezone) {
  const now = new Date()
  const zonedNow = toZonedTime(now, timezone)
  const monthStart = startOfMonth(zonedNow)
  return format(monthStart, 'yyyy-MM-dd')
}

export function convertToUserTimezone(date, timezone) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, timezone, "yyyy-MM-dd")
}

export function parseUserDate(dateStr, timezone) {
  return fromZonedTime(`${dateStr} 00:00:00`, timezone)
}

export function formatRelativeDateInTimezone(date, timezone) {
  const inputDate = typeof date === 'string' ? parseISO(date) : date
  const zonedInputDate = toZonedTime(inputDate, timezone)
  const zonedToday = toZonedTime(new Date(), timezone)

  const inputDateStart = startOfDay(zonedInputDate)
  const todayStart = startOfDay(zonedToday)

  const diffDays = differenceInDays(todayStart, inputDateStart)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  }
  const years = Math.floor(diffDays / 365)
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
}

export function getDaysAgoInTimezone(days, timezone) {
  const now = new Date()
  const zonedNow = toZonedTime(now, timezone)
  const past = new Date(zonedNow)
  past.setDate((past.getDate() - days))
  return format(past, 'yyyy-MM-dd')
}

export function isTodayInTimezone(dateStr, timezone) {
  const today = getCurrentDateInTimezone(timezone)
  return dateStr === today
}

export function formatDateInTimezone(date, timezone, formatStr = "MMM d, yyyy") {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, timezone, formatStr)
}

export function getStartOfLastWeekInTimezone(timezone) {
  const now = new Date()
  const zonedNow = toZonedTime(now, timezone)
  const weekStart = startOfWeek(zonedNow, { weekStartsOn: 1 })
  const lastWeek = new Date(weekStart)
  lastWeek.setDate(lastWeek.getDate() - 7)
  return format(lastWeek, 'yyyy-MM-dd')
}

export function getStartOfLastMonthInTimezone(timezone) {
  const now = new Date()
  const zonedNow = toZonedTime(now, timezone)
  const monthStart = startOfMonth(zonedNow)
  const lastMonth = new Date(monthStart)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  return format(lastMonth, 'yyyy-MM-dd')
}

export function calculateEndDate(startDate, targetPeriod) {
  const start = parseISO(startDate)

  switch (targetPeriod) {
    case "DAILY":
      return format(addDays(start, 1), 'yyyy-MM-dd')
    case "WEEKLY":
      return format(addWeeks(start, 1), "yyyy-MM-dd")
    case "MONTHLY":
      return format(addMonths(start, 1), 'yyyy-MM-dd')
    case "QUARTERLY":
      return format(addQuarters(start, 1), 'yyyy-MM-dd')
    case "YEARLY":
      return format(addYears(start, 1), 'yyyy-MM-dd')
    default:
      throw new Error(`Unknown target period: ${targetPeriod}`)
  }
}
