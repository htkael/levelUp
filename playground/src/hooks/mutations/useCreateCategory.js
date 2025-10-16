import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryData) => {
      const response = await api("/auth/category/create", { category })

      if (!response.success) {
        throw new Error(response.error || "Failed to create category")
      }

      return response.created
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },

    onError: (error) => {
      console.error("Failed to create category:", error)
    }
  })
}
