import React, { useCallback } from 'react'
import { YStack, H2, Text, Button, Input, XStack, Spinner } from 'tamagui'
import { FlatList, SafeAreaView } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { Search, Plus } from '@tamagui/lucide-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import type { Paths } from '../api/generated/client'
import { useInvoices } from '../hooks/useInvoices'
import { InvoiceListItem } from '../components/InvoiceListItem'
import { FilterChips } from '../components/FilterChips'

type RootStackParamList = {
  InvoiceDetails: { invoiceId: string }
  InvoiceForm: undefined
}
type Invoice = Paths.GetInvoices.Responses.$200['invoices'][0]
type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export const InvoiceList = () => {
  const navigation = useNavigation<NavigationProp>()
  const {
    searchQuery,
    setSearchQuery,
    selectedFilters,
    allInvoices,
    isLoading,
    error,
    isFetchingNextPage,
    handleToggleFilter,
    handleLoadMore,
  } = useInvoices()
  const queryClient = useQueryClient()

  const handleInvoicePress = useCallback(
    (invoice: Invoice) => {
      navigation.navigate('InvoiceDetails', {
        invoiceId: invoice.id.toString(),
      })
    },
    [navigation],
  )

  const handleCreateInvoice = useCallback(() => {
    navigation.navigate('InvoiceForm')
  }, [navigation])

  const renderItem = useCallback(
    (props: { item: Invoice }) => (
      <InvoiceListItem
        key={props.item.id}
        invoice={props.item}
        onPress={() => handleInvoicePress(props.item)}
      />
    ),
    [handleInvoicePress],
  )

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null
    return (
      <YStack flex={1} padding="$4" alignItems="center">
        <Spinner size="large" color="$blue10" />
      </YStack>
    )
  }, [isFetchingNextPage])

  const renderEmpty = useCallback(() => {
    if (isLoading) return <Text>Chargement...</Text>
    if (error) {
      return (
        <Text color="$red10">
          Une erreur est survenue lors du chargement des factures
        </Text>
      )
    }
    return <Text>Aucune facture trouvée</Text>
  }, [isLoading, error])

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }, [queryClient]),
  )

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack paddingHorizontal="$4" flex={1}>
        <XStack alignItems="center" justifyContent="space-between">
          <H2>Factures</H2>

          <Button
            icon={Plus}
            onPress={handleCreateInvoice}
            theme="blue"
            pressStyle={{ opacity: 0.7 }}
            testID="add-invoice-button"
          >
            Nouvelle facture
          </Button>
        </XStack>

        <XStack alignItems="center" marginVertical="$4">
          <XStack
            alignItems="center"
            flex={1}
            backgroundColor="$gray3"
            borderRadius="$4"
            padding="$2"
          >
            <Search size={20} color="$gray10" />
            <Input
              flex={1}
              placeholder="Rechercher une facture..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              backgroundColor="transparent"
              borderWidth={0}
              testID="search-input"
            />
          </XStack>
        </XStack>

        <FilterChips
          selectedFilters={selectedFilters}
          onToggleFilter={handleToggleFilter}
          testID="filter-chips"
        />

        <YStack marginTop="$4" flex={1}>
          <FlatList
            data={allInvoices}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={0.8}
            onMomentumScrollEnd={handleLoadMore}
            contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            testID="invoice-list"
          />
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
