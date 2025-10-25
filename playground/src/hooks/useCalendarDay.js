import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useCalendarDay = (day) => {
  return useQuery({
    queryKey: ["calendarDay", day],
    queryFn: async () => {
      const response = await api("/auth/progress-entry/day-detail", { day })
      if (!response.success) {
        throw new Error(response.error || "Failed to list day details")
      }
      return response.data
    },
    enabled: !!day,
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
