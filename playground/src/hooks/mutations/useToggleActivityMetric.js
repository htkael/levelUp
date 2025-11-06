import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useToggleActivityMetric = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (metric) => {
      const response = await api("/auth/activity-metric/primary", { id: metric.metricId })
      if (!response.success) {
        throw new Error(response.error || "Failed to toggle activity metric")
      }

      return response
    },

    onSuccess: (data, variables) => {
      toast.success("Metric successfully set as primary!")
      queryClient.invalidateQueries({ queryKey: ["activity", Number(variables.activityId)] })
      queryClient.invalidateQueries({ queryKey: ["activityStats", Number(variables.activityId)] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to toggle metric type.")
      console.error("Failed to toggle metric type", error)
    }
  })
}
