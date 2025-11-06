import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useCreateMetricType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (metricTypeData) => {
      const response = await api("/auth/activity-metric/create", { activityMetric: metricTypeData })
      if (!response.success) {
        throw new Error(response.error || "Failed to create metric type")
      }

      return response.created
    },

    onSuccess: (data) => {
      toast.success("Metric created successfully!")
      queryClient.invalidateQueries({ queryKey: ["activity", Number(data.activityId)] })
      queryClient.invalidateQueries({ queryKey: ["activityMetric", Number(data.activityId)] })
      queryClient.invalidateQueries({ queryKey: ["activityStats", Number(data.activityId)] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to create metric type.")
      console.error("Failed to create metric type", error)
    }
  })
}
