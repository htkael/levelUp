import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useCategoryStats = (categoryId) => {
  return useQuery({
    queryKey: ["categoryStats", Number(categoryId)],
    queryFn: async () => {
      const response = await api("/auth/category/stats", { id: categoryId })
      if (!response.success) {
        throw new Error(response.error || "Error getting category stats")
      }
      return response.data
    },
    enabled: !!categoryId,
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
