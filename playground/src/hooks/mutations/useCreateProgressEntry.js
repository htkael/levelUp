import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useCreateProgressEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entryData) => {
      const response = await api("/auth/progress-entry/create", { progressEntry: entryData })
      if (!response.success) {
        throw new Error(response.error || "Failed to create progress entry")
      }

      return response.created
    },

    onSuccess: (data) => {
      toast.success("Progress entry created successfully!")
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['calendarDay'] })
      queryClient.invalidateQueries({ queryKey: ['category'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['activityMetric', data.activityId] })
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['activity', data.activityId] })
      queryClient.invalidateQueries({ queryKey: ['activityStats', data.activityId] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to create progress entry")
      console.error("Failed to create progress entry", error)
    }
  })
}
