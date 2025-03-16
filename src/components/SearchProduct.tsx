import React, {
  useState,
  useCallback,
  useDeferredValue,
  memo,
  useMemo,
} from 'react'
import { FlatList } from 'react-native'
import { Sheet, Button, XStack, YStack, Text, Spinner } from 'tamagui'
import { Package, X, Minus, Plus } from '@tamagui/lucide-icons'

import { SearchInput } from './SearchInput'

import { Paths } from '../api/generated/client'
import { useProductSearch } from '../hooks/useProductSearch'

type Product = Paths.GetSearchProducts.Responses.$200['products'][0]

type ProductListProps = {
  searchQuery: string
  onSelect: (product: Product) => void
  selectedProductIds: number[]
}

interface ProductWithQuantity extends Product {
  quantity: number
}

type SearchProductProps = {
  selectedProducts: ProductWithQuantity[]
  onProductSelect: (product: Product) => void
  onProductRemove: (productId: number) => void
  onQuantityChange: (productId: number, quantity: number) => void
  testID?: string
}

const ProductList = memo(
  ({ searchQuery, onSelect, selectedProductIds }: ProductListProps) => {
    const { products, isLoading, error } = useProductSearch(searchQuery)

    const filteredProducts = useMemo(() => {
      if (!products) return []
      return products.filter(
        (product) => !selectedProductIds.includes(product.id),
      )
    }, [products, selectedProductIds])

    const handleProductSelect = useCallback(
      (product: Product) => {
        onSelect(product)
      },
      [onSelect],
    )

    const renderItem = useCallback(
      (props: { item: Product }) => {
        return (
          <Button
            testID={`product-item-${props.item.id}`}
            onPress={() => handleProductSelect(props.item)}
            theme="alt2"
            animation="quick"
            pressStyle={{ scale: 0.97 }}
            hoverStyle={{ backgroundColor: '$blue5' }}
            marginVertical="$1"
          >
            <XStack gap="$2" alignItems="center">
              <Package size={24} />
              <YStack flex={1}>
                <Text fontWeight="bold" numberOfLines={1}>
                  {props.item.label}
                </Text>
                <Text fontSize="$2" color="$gray11" numberOfLines={1}>
                  Prix HT: {props.item.unit_price_without_tax} € - TVA{' '}
                  {props.item.vat_rate}%
                </Text>
              </YStack>
            </XStack>
          </Button>
        )
      },
      [handleProductSelect],
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
              Aucun produit trouvé
            </Text>
          </YStack>
        )
      }

      return null
    }, [isLoading, error, searchQuery.length])

    return (
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{ padding: 8 }}
        showsVerticalScrollIndicator={false}
      />
    )
  },
)

ProductList.displayName = 'ProductList'

export const SearchProduct = ({
  selectedProducts,
  onProductSelect,
  onProductRemove,
  onQuantityChange,
  testID,
}: SearchProductProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const deferredSearchQuery = useDeferredValue(searchValue)

  const selectedProductIds = useMemo(
    () => selectedProducts.map((product) => product.id),
    [selectedProducts],
  )

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
  }, [])

  const handleInputChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const handleProductSelect = useCallback(
    (product: Product) => {
      onProductSelect(product)
      setOpen(false)
    },
    [onProductSelect],
  )

  const handleProductRemove = useCallback(
    (productId: number) => {
      onProductRemove(productId)
    },
    [onProductRemove],
  )

  const handleDecrementQuantity = useCallback(
    (productId: number, currentQuantity: number) => {
      if (currentQuantity > 1) {
        onQuantityChange(productId, currentQuantity - 1)
      }
    },
    [onQuantityChange],
  )

  const handleIncrementQuantity = useCallback(
    (productId: number, currentQuantity: number) => {
      onQuantityChange(productId, currentQuantity + 1)
    },
    [onQuantityChange],
  )

  return (
    <YStack gap="$2">
      <Button
        testID={testID}
        icon={Package}
        onPress={() => setOpen(true)}
        theme={selectedProducts.length > 0 ? 'active' : undefined}
        size="$4"
        backgroundColor={selectedProducts.length > 0 ? '$blue5' : '$gray5'}
        justifyContent="flex-start"
      >
        Ajouter un produit
      </Button>

      {selectedProducts.map((product) => (
        <XStack
          key={product.id}
          backgroundColor="$blue5"
          paddingHorizontal="$4"
          paddingVertical="$2"
          borderRadius="$4"
          alignItems="center"
          gap="$2"
          marginBottom="$2"
        >
          <Package size={16} />
          <YStack flex={1}>
            <Text numberOfLines={1}>{product.label}</Text>
            <Text fontSize="$2" color="$gray11">
              Prix unitaire : {product.unit_price} €
            </Text>
          </YStack>

          <XStack
            gap="$2"
            alignItems="center"
            backgroundColor="$gray5"
            borderRadius="$4"
            padding="$1"
          >
            <Button
              icon={Minus}
              size="$2"
              circular
              onPress={() =>
                handleDecrementQuantity(product.id, product.quantity)
              }
              theme="gray"
              disabled={product.quantity <= 1}
            />
            <Text
              fontSize="$4"
              fontWeight="bold"
              minWidth={24}
              textAlign="center"
            >
              {product.quantity}
            </Text>
            <Button
              icon={Plus}
              size="$2"
              circular
              onPress={() =>
                handleIncrementQuantity(product.id, product.quantity)
              }
              theme="gray"
              testID="plus-button"
            />
          </XStack>

          <Button
            icon={X}
            size="$2"
            circular
            onPress={() => handleProductRemove(product.id)}
            theme="red"
          />
        </XStack>
      ))}

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
            Rechercher un produit
          </Text>

          <SearchInput
            value={searchValue}
            onChange={handleInputChange}
            placeholder="Rechercher un produit..."
          />

          <YStack flex={1}>
            <ProductList
              searchQuery={deferredSearchQuery}
              onSelect={handleProductSelect}
              selectedProductIds={selectedProductIds}
            />
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  )
}
