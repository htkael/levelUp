import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useActivityBasic = (activityId) => {
  return useQuery({
    queryKey: ["activity", Number(activityId)],
    queryFn: async () => {
      const response = await api("/auth/activity/get", { id: activityId })
      if (!response.success) {
        throw new Error(response.error || "Failed to list basic activity info")
      }
      return response.activity
    },
    enabled: !!activityId,
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
