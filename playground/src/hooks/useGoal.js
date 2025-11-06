import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useGoal = ({ id }) => {
  return useQuery({
    queryKey: ["goal", id],
    queryFn: async () => {
      const response = await api("/auth/goal/get", { id })
      console.log("response", response)

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch goal")
      }

      return response.goal
    }
  })
}
