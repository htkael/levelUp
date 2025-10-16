import { useQuery } from "@tanstack/react-query"
import { api } from "../utils/api"

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api("/auth/dashboard")
      if (response?.error) throw new Error(`Failed to fetch dashboard ${response.error}`)
      return response
    },
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
