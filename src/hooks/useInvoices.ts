import { useCallback, useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { useApi } from '../api'
import { FilterStatus } from '../components/FilterChips'

type FilterConfig = {
  field: string
  operator: 'eq'
  getValue: (value: FilterStatus) => boolean
}
const ITEMS_PER_PAGE = 10

const FILTER_CONFIGS: Record<Exclude<FilterStatus, null>, FilterConfig> = {
  paid: {
    field: 'paid',
    operator: 'eq',
    getValue: () => true,
  },
  finalized: {
    field: 'finalized',
    operator: 'eq',
    getValue: () => true,
  },
  draft: {
    field: 'finalized',
    operator: 'eq',
    getValue: () => false,
  },
}

const buildFilters = (searchQuery: string, selectedFilters: FilterStatus[]) => {
  const filters = []

  if (searchQuery) {
    filters.push({
      field: 'customer.last_name',
      operator: 'eq' as const,
      value: searchQuery,
    })
  }

  selectedFilters
    .filter((filter): filter is Exclude<FilterStatus, null> => filter !== null)
    .forEach((filter) => {
      const config = FILTER_CONFIGS[filter]
      filters.push({
        field: config.field,
        operator: config.operator,
        value: config.getValue(filter),
      })
    })

  return filters
}

export const useInvoices = () => {
  const api = useApi()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedFilters, setSelectedFilters] = useState<FilterStatus[]>([])

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ['invoices', searchQuery, selectedFilters],
    queryFn: async ({ pageParam = 1 }) => {
      const filters = buildFilters(searchQuery, selectedFilters)
      const response = await api.get(
        `/invoices?page=${pageParam}&per_page=${ITEMS_PER_PAGE}&filter=${JSON.stringify(
          filters,
        )}`,
      )

      return {
        invoices: response.data.invoices,
        pagination: response.data.pagination,
        pageParam,
      }
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pageParam
      const totalPages = lastPage.pagination.total_pages

      return currentPage < totalPages ? currentPage + 1 : undefined
    },
  })

  const handleToggleFilter = useCallback((filter: FilterStatus) => {
    setSelectedFilters((current) =>
      current.includes(filter)
        ? current.filter((f) => f !== filter)
        : [...current, filter],
    )
  }, [])

  const allInvoices = useMemo(
    () => data?.pages.flatMap((page) => page.invoices) || [],
    [data],
  )

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    allInvoices,
    isLoading,
    error,
    isFetchingNextPage,
    handleToggleFilter,
    handleLoadMore,
  }
}
