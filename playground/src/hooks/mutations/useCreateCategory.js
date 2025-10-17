import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryData) => {
      const response = await api("/auth/category/create", { category: categoryData })

      if (!response.success) {
        throw new Error(response.error || "Failed to create category")
      }

      return response.created
    },

    onSuccess: () => {
      toast.success("Category created successfully")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },

    onError: (error) => {
      toast.error(error.message || "Something went wrong")
      console.error("Failed to create category:", error)
    }
  })
}
