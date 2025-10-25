import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useUpdateProgressEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (progressEntry) => {
      const response = await api("/auth/progress-entry/update", { progressEntry })
      if (!response.success) {
        throw new Error(response.error || "Error updating progress entry")
      }

      return { updated: response.updated, updatedMetrics: response.updatedMetrics }
    },

    onSuccess: (data) => {
      toast.success("Progress entry updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["progressEntry", data.updated.id] })
      queryClient.invalidateQueries({ queryKey: ["activityStats", data.updated.activityId] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
      queryClient.invalidateQueries({ queryKey: ["calendarDay"] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update progress entry")
      console.error("Failed to update progress entry", error)
    }
  })
}
