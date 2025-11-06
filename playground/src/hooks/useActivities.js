import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useActivities = ({ groupId, categoryId, isActive }) => {
  return useQuery({
    queryKey: ["activities", Number(groupId), Number(categoryId), isActive],
    queryFn: async () => {
      const response = await api("/auth/activity/list", { groupId, categoryId, isActive })
      if (!response.success) {
        throw new Error(response.error || "Error listing activities")
      }
      return response.activities
    },
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
