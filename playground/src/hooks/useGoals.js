import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useGoals = ({ activityId, isActive, groupId }) => {
  return useQuery({
    queryKey: ['goals', activityId, isActive, groupId],
    queryFn: async () => {
      const response = await api("/auth/goal/list", { activityId, isActive, groupId })

      if (!response.success) {
        throw new Error(response.error || "Failed to list goals")
      }

      return response.goals
    }
  })
}
