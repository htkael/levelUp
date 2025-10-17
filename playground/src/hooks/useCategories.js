import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api.js"

export const useCategories = (groupId) => {
  return useQuery({
    queryKey: ['categories', Number(groupId)],
    queryFn: async () => {
      const response = await api("/auth/category/list", { groupId })
      if (response?.error) throw new Error(`Failed to fetch categories ${response.error}`)
      return response.categories
    },
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
