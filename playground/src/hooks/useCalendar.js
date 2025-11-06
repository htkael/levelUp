import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api.js"

export const useCalendar = ({ activityId, categoryId, month }) => {
  return useQuery({
    queryKey: ["calendar", Number(activityId), Number(categoryId), month],
    queryFn: async () => {
      const response = await api("/auth/progress-entry/calendar", { activityId, categoryId, month })
      if (!response.success) {
        throw new Error(response.error || "Failed to list progress entry calendar")
      }

      return response.data
    },
    enabled: !!month,
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
