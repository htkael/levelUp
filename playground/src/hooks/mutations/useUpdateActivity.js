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

    onSuccess: () => {
      toast.success("Activity updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update activity")
      console.error("Failed to update activity", error)
    }
  })
}
