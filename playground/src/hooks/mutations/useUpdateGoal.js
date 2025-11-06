import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useUpdateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goal) => {
      const response = await api("/auth/goal/update", { goal })

      if (!response.success) {
        throw new Error(response.error || "Failed to update goal")
      }

      return response.updated
    },

    onSuccess: (data) => {
      toast.success("Goal updated successfully!")
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goal', Number(data.id)] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["activity", Number(data.activityId)] })
      queryClient.invalidateQueries({ queryKey: ["activityStats", Number(data.activityId)] })
    },

    onError: (error) => {
      console.error("Failed to update goal", error)
      toast.error(error.message || "Failed to update goal!")
    }
  })
}
