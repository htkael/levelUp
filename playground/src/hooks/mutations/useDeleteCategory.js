import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (categoryId) => {
      const response = await api("/auth/category/delete", { id: categoryId })

      if (!response.success) {
        throw new Error(response.error || "Failed to delete category")
      }
    },

    onSuccess: () => {
      toast.success("Category deleted successully!")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },

    onError: (error) => {
      toast.error(error.message || "Something went wrong")
      console.error("Failed to delete category:", error)
    }
  })
}
