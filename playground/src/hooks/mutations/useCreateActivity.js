import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useCreateActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (activityData) => {
      const response = await api("/auth/activity/create", { activity: activityData })
      if (!response.success) {
        throw new Error(response.error || "Failed to create activity")
      }

      return response.created
    },

    onSuccess: (data) => {
      toast.success("Activity created successfully!")
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["category", data.categoryId] })
      queryClient.invalidateQueries({ queryKey: ["categoryStats", data.categoryId] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to create activity")
      console.error("Failed to create activity", error)
    }
  })
}
