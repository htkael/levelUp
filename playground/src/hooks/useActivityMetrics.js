import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api.js"

export const useActivityMetrics = (activityId) => {
  return useQuery({
    queryKey: ["activityMetric", activityId],
    queryFn: async () => {
      const response = await api("/auth/activity-metric/list", { activityId })
      if (!response.success) {
        throw new Error(response.error || "Failed to list activity metrics")
      }
      return response.metrics
    },
    enabled: !!activityId,
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
