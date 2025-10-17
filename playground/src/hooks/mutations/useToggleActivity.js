import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useToggleActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activity) => {
      const response = await api('/auth/activity/toggle', { id: activity.id })
      if (!response.success) {
        throw new Error(response.error || "Failed to toggle activity")
      }
      return response.updated
    },

    onSuccess: (data) => {
      toast.success("Activity toggled successfully!")
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["activity", data.id] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to toggle activity.")
      console.error("Failed to toggle activity", error)
    }
  })
}
