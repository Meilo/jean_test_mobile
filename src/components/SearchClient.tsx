import React, {
  useState,
  useCallback,
  useDeferredValue,
  memo,
  useMemo,
} from 'react'
import { Sheet, Button, XStack, YStack, Text, Spinner } from 'tamagui'
import { User } from '@tamagui/lucide-icons'
import { useApi } from '../api'
import { Paths } from '../api/generated/client'
import { CustomerAvatar } from './CustomerAvatar'
import { SearchInput } from './SearchInput'
import { useQuery } from '@tanstack/react-query'
import { FlatList } from 'react-native'

type Customer = Paths.GetSearchCustomers.Responses.$200['customers'][0]

interface SearchClientProps {
  selectedCustomer: Customer | null
  onCustomerSelect: (customer: Customer) => void
  testID?: string
}

const useCustomerSearch = (searchQuery: string) => {
  const api = useApi()

  const {
    data: customers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      if (searchQuery.length === 0) return []
      const response = await api.getSearchCustomers({ query: searchQuery })
      return response.data.customers
    },
    enabled: searchQuery.length > 0,
  })

  return {
    customers,
    isLoading,
    error,
  }
}

interface CustomerListProps {
  searchQuery: string
  onSelect: (customer: Customer) => void
}

const CustomerList = memo(({ searchQuery, onSelect }: CustomerListProps) => {
  const { customers, isLoading, error } = useCustomerSearch(searchQuery)

  const handleCustomerSelect = useCallback(
    (customer: Customer) => {
      onSelect(customer)
    },
    [onSelect],
  )

  const renderItem = useCallback(
    (props: { item: Customer }) => {
      return (
        <Button
          onPress={() => handleCustomerSelect(props.item)}
          theme="alt2"
          animation="quick"
          pressStyle={{ scale: 0.97 }}
          hoverStyle={{ backgroundColor: '$blue5' }}
          marginVertical="$1"
        >
          <XStack gap="$2" alignItems="center">
            <CustomerAvatar size={30} />
            <YStack flex={1}>
              <Text fontWeight="bold" numberOfLines={1}>
                {props.item.first_name} {props.item.last_name}
              </Text>
              <Text fontSize="$2" color="$gray11" numberOfLines={1}>
                {props.item.address}, {props.item.zip_code} {props.item.city}
              </Text>
            </YStack>
          </XStack>
        </Button>
      )
    },
    [handleCustomerSelect],
  )

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <YStack height={200} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$blue10" />
        </YStack>
      )
    }

    if (error) {
      return (
        <YStack height={200} justifyContent="center" alignItems="center">
          <Text color="$red10" textAlign="center">
            Une erreur est survenue lors de la recherche
          </Text>
        </YStack>
      )
    }

    if (searchQuery.length > 0) {
      return (
        <YStack height={200} justifyContent="center" alignItems="center">
          <Text color="$gray11" textAlign="center">
            Aucun client trouvé
          </Text>
        </YStack>
      )
    }

    return null
  }, [isLoading, error, searchQuery.length])

  return (
    <FlatList
      data={customers || []}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={{ padding: 8 }}
      showsVerticalScrollIndicator={false}
    />
  )
})

CustomerList.displayName = 'CustomerList'

export const SearchClient = ({
  selectedCustomer,
  onCustomerSelect,
  testID,
}: SearchClientProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const deferredSearchQuery = useDeferredValue(searchValue)

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
  }, [])

  const handleInputChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const handleCustomerSelect = useCallback(
    (customer: Customer) => {
      onCustomerSelect(customer)
      setOpen(false)
    },
    [onCustomerSelect],
  )

  return (
    <>
      <Button
        testID={testID}
        icon={User}
        onPress={() => setOpen(true)}
        theme={selectedCustomer ? 'active' : undefined}
        size="$4"
        backgroundColor={selectedCustomer ? '$blue5' : '$gray5'}
        justifyContent="flex-start"
      >
        {selectedCustomer
          ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
          : 'Sélectionner un client'}
      </Button>

      <Sheet
        modal
        open={open}
        onOpenChange={handleOpenChange}
        snapPoints={[80]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4" gap>
          <Sheet.Handle />
          <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
            Rechercher un client
          </Text>

          <SearchInput
            value={searchValue}
            onChange={handleInputChange}
            placeholder="Rechercher un client..."
          />

          <YStack flex={1}>
            <CustomerList
              searchQuery={deferredSearchQuery}
              onSelect={handleCustomerSelect}
            />
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
