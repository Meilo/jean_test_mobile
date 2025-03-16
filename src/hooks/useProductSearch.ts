import { useQuery } from '@tanstack/react-query'
import { useApi } from '../api'

export const useProductSearch = (searchQuery: string) => {
  const api = useApi()

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      if (searchQuery.length === 0) return []
      const response = await api.getSearchProducts({ query: searchQuery })
      return response.data.products
    },
    enabled: searchQuery.length > 0,
  })

  return {
    products,
    isLoading,
    error,
  }
}
