import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useUpdateActivityMetric = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (metricData) => {
      const response = await api("/auth/activity-metric/update", { activityMetric: metricData })
      console.log("resposne", response)
      if (!response.success) {
        throw new Error(response.error || "Failed to update activity metric")
      }

      return response.updated
    },

    onSuccess: (data) => {
      toast.success("Metric updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["activity", data.activityId] })
      queryClient.invalidateQueries({ queryKey: ["activityStats", data.activityId] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update metric type.")
      console.error("Failed to update metric type", error)
    }
  })
}
