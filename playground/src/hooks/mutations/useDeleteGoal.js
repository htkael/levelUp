import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goal) => {
      const response = await api("/auth/goal/delete", { id: goal.id })

      if (!response.success) {
        throw new Error(response.error || "Failed to delete goal")
      }

      return
    },

    onSuccess: (data, variables) => {
      toast.success("Goal deleted successfully!")
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["activity", Number(variables.activityId)] })
      queryClient.invalidateQueries({ queryKey: ["activityStats", Number(variables.activityId)] })
    }
  })
}
