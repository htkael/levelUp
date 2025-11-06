import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useCreateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goal) => {
      const response = await api("/auth/goal/create", { goal })

      if (!response.success) {
        throw new Error(response.error || "Failed to create goal")
      }

      return response.created
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      queryClient.invalidateQueries({ queryKey: ["activity", data.activityId] })
      queryClient.invalidateQueries({ queryKey: ["activityStats", data.activityId] })

      toast.success("Goal created successfully!")
    },

    onError: (error) => {
      toast.error(error.message || "Failed to create goal.")
      console.error("Failed to create goal", error)
    }
  })
}
