import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useActivityStats = (activityId) => {
  return useQuery({
    queryKey: ["activityStats", Number(activityId)],
    queryFn: async () => {
      const response = await api("/auth/activity/stats", { id: activityId })
      if (!response.success) {
        throw new Error(response.error || "Failed to list activity stats")
      }
      return response.data
    },
    enabled: !!activityId,
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
