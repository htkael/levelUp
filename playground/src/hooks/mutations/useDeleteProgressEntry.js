import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useDeleteProgressEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry) => {
      const response = await api("/auth/progress-entry/delete", { id: entry.id })
      if (!response.success) {
        throw new Error(response.error || "Failed to delete progress entry")
      }

      return
    },

    onSuccess: (data, variables) => {
      toast.success("Progress entry deleted successfully!")
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['category'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['activityMetric', variables.activityId] })
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['activity', variables.activityId] })
      queryClient.invalidateQueries({ queryKey: ['activityStats', variables.activityId] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to delete progress entry!")
      console.error("Failed to delete progress entry", error)
    }
  })
}
