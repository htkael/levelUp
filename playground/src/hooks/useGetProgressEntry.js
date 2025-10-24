import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

export const useGetProgressEntry = (id) => {
  return useQuery({
    queryKey: ["progressEntry", id],
    queryFn: async () => {
      const response = await api("/auth/progress-entry/get", { entryId: id })
      if (!response.success) {
        throw new Error(response.error || "Progress entry not found")
      }

      return response.entry
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    retry: 2
  })
}
