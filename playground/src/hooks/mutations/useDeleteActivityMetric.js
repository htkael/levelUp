import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useDeleteActivityMetric = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (metric) => {
      const response = await api("/auth/activity-metric/delete", { id: metric.metricId })
      if (!response.success) {
        throw new Error(response.error || "Failed to delete activity metric")
      }

      return response
    },

    onSuccess: (data, variables) => {
      toast.success("Metric successfully deleted!")
      queryClient.invalidateQueries({ queryKey: ["activity", variables.activityId] })
      queryClient.invalidateQueries({ queryKey: ["activityStats", variables.activityId] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to delete metric type.")
      console.error("Failed to delete metric type", error)
    }
  })
}
