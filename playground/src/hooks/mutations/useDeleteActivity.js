import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useDeleteActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (activity) => {
      const response = await api("/auth/activity/delete", { id: activity.id })
      if (!response.success) {
        throw new Error(response.error || "Failed to delete activity")
      }

      return response
    },

    onSuccess: (data, variables) => {
      toast.success("Activity deleted successfully!")
      console.log("vars", variables)
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["category", variables.categoryId] })
      queryClient.invalidateQueries({ queryKey: ["categoryStats", variables.categoryId] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to delete activity")
      console.error("Failed to delete activity", error)
    }
  })
}
