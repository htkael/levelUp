import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useUpdateActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityData) => {
      const response = await api("/auth/activity/update", { activity: activityData })
      if (!response.success) {
        throw new Error(response.error || "Failed to update activity")
      }
      return response.updated
    },

    onSuccess: (data) => {
      toast.success("Activity updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["category", data.categoryId] })
      queryClient.invalidateQueries({ queryKey: ["categoryStats", data.categoryId] })
      queryClient.invalidateQueries({ queryKey: ["activity", data.id] })
      queryClient.invalidateQueries({ queryKey: ["activityStats", data.id] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
      queryClient.invalidateQueries({ queryKey: ["calendarDay"] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update activity")
      console.error("Failed to update activity", error)
    }
  })
}
