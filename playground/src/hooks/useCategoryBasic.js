import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useCategoryBasic = (categoryId) => {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      const response = await api("/auth/category/get", { id: categoryId })
      console.log("response", response)
      if (!response.success) {
        throw new Error(response.error || "Error getting basic category info")
      }
      return response.category
    },
    enabled: !!categoryId,
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
