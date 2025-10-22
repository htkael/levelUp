import { formatDistanceToNow, isToday, isYesterday, parseISO, startOfDay } from "date-fns"


export const formatRelativeDate = (dateString) => {
  if (!dateString) return "Never"
  console.log("dateString", dateString)

  const date = startOfDay(parseISO(dateString))

  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"

  return formatDistanceToNow(date, { addSuffix: true })
}
