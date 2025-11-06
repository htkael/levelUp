import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useGoal = ({ id }) => {
  return useQuery({
    queryKey: ["goal", Number(id)],
    queryFn: async () => {
      const response = await api("/auth/goal/get", { id })

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch goal")
      }

      return response.goal
    }
  })
}
