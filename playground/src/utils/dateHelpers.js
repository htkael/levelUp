import { formatDistanceToNow } from "date-fns"

export const formatRelativeDate = (dateString) => {
  if (!dateString) return "Never"

  const date = new Date(dateString)

  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return "Today"
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  return formatDistanceToNow(date, { addSuffix: true })
}
