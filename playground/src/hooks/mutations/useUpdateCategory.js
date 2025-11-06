import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../utils/api";
import { toast } from "react-toastify";

export const useUpdateCategory = () => {
  const queryclient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryData) => {
      const response = await api("/auth/category/update", { category: categoryData })

      if (!response.success) {
        throw new Error(response.error || "Error updating category")
      }

      return response.updated
    },

    onSuccess: (data, variables) => {
      toast.success("Successfully updated category")
      queryclient.invalidateQueries({ queryKey: ["categories"] })
      queryclient.invalidateQueries({ queryKey: ["category", Number(variables.id)] })
      queryclient.invalidateQueries({ queryKey: ["categoryStats", Number(variables.id)] })
      queryclient.invalidateQueries({ queryKey: ["dashboard"] })
      queryclient.invalidateQueries({ queryKey: ["calendar"] })
      queryclient.invalidateQueries({ queryKey: ["calendarDay"] })
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update category")
      console.error("Error updating category", error)
    }
  })
}
