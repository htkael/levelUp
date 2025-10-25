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
      queryClient.invalidateQueries({ queryKey: ["activityMetric", data.activityId] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
      queryClient.invalidateQueries({ queryKey: ["calendarDay"] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update metric type.")
      console.error("Failed to update metric type", error)
    }
  })
}
