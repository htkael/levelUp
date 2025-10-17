import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useDeleteActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const response = await api("/auth/activity/delete", { id })
      if (!response.success) {
        throw new Error(response.error || "Failed to delete activity")
      }

      return response
    },

    onSuccess: () => {
      toast.success("Activity deleted successfully!")
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to delete activity")
      console.error("Failed to delete activity", error)
    }
  })
}
