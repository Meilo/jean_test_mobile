import React, { useCallback, useMemo } from 'react'
import {
  YStack,
  H2,
  Text,
  ScrollView,
  XStack,
  Button,
  Separator,
  Spinner,
} from 'tamagui'
import { Save } from '@tamagui/lucide-icons'
import { useForm, Controller } from 'react-hook-form'
import { useRoute } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'

import { Paths } from '../api/generated/client'
import { useApi } from '../api'
import {
  SearchClient,
  SearchProduct,
  DateInput,
  FinalizeButton,
} from '../components'

import { useInvoiceFormSubmit } from '../hooks/useInvoiceFormSubmit'

type Customer = Paths.GetSearchCustomers.Responses.$200['customers'][0]
type Product = Paths.GetSearchProducts.Responses.$200['products'][0]

type Invoice = Paths.GetInvoices.Responses.$200['invoices'][0]
type InvoiceLine = Invoice['invoice_lines'][0]

interface ProductWithQuantity extends Product {
  quantity: number
  invoice_line_id?: number
  _destroy?: boolean
}

export interface InvoiceFormData {
  customer: Customer | null
  products: ProductWithQuantity[]
  dueDate: string
}

type RouteParams = {
  invoiceId?: number
}

export const InvoiceForm = () => {
  const api = useApi()
  const route = useRoute()
  const { onSaveDraft, onSubmit, setDeletedLineIds } = useInvoiceFormSubmit()
  const { invoiceId } = (route.params as RouteParams) || {}

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      customer: null,
      products: [],
      dueDate: '',
    },
  })

  const selectedProducts = watch('products')

  const totals = useMemo(() => {
    const subtotal = selectedProducts.reduce(
      (sum, product) => sum + parseFloat(product.unit_price) * product.quantity,
      0,
    )
    const tva = selectedProducts.reduce(
      (sum, product) => sum + parseFloat(product.unit_tax) * product.quantity,
      0,
    )
    const total = subtotal + tva
    return {
      subtotal: subtotal.toFixed(2),
      tva: tva.toFixed(2),
      total: total.toFixed(2),
    }
  }, [selectedProducts])

  const { isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null
      const response = await api.getInvoice({ id: invoiceId })
      const invoice = response.data as Invoice

      reset({
        customer: invoice.customer || null,
        products: invoice.invoice_lines.map((line: InvoiceLine) => ({
          id: line.product_id,
          label: line.label,
          unit: line.unit,
          unit_price: line.price,
          unit_tax: line.tax,
          vat_rate: line.vat_rate,
          quantity: line.quantity,
          invoice_line_id: line.id,
        })),
        dueDate: invoice.deadline || '',
      })

      return invoice
    },
    enabled: !!invoiceId,
  })

  const handleProductSelect = useCallback(
    (product: Product) => {
      const currentProducts = watch('products')
      setValue('products', [...currentProducts, { ...product, quantity: 1 }])
    },
    [watch, setValue],
  )

  const handleProductRemove = useCallback(
    (productId: number) => {
      const currentProducts = watch('products')
      const productToRemove = currentProducts.find((p) => p.id === productId)
      const lineId = productToRemove?.invoice_line_id

      if (
        typeof lineId === 'number' &&
        typeof productId === 'number' &&
        productToRemove
      ) {
        setDeletedLineIds((prev) => [
          ...prev,
          {
            id: lineId,
            productId,
            label: productToRemove.label,
            unit: productToRemove.unit,
            vatRate: productToRemove.vat_rate || '0.2',
            price: productToRemove.unit_price,
          },
        ])
      }

      setValue(
        'products',
        currentProducts.filter((product) => product.id !== productId),
      )
    },
    [watch, setValue, setDeletedLineIds],
  )

  const handleQuantityChange = useCallback(
    (productId: number, quantity: number) => {
      const currentProducts = watch('products')
      setValue(
        'products',
        currentProducts.map((product) =>
          product.id === productId ? { ...product, quantity } : product,
        ),
      )
    },
    [watch, setValue],
  )

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner testID="loading-spinner" size="large" />
      </YStack>
    )
  }

  return (
    <YStack flex={1}>
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$6">
          <XStack alignItems="center" justifyContent="space-between">
            <H2 testID="form-title">
              {invoiceId ? 'Modifier la facture' : 'Nouvelle facture'}
            </H2>
          </XStack>

          <YStack gap="$4">
            <Text fontSize="$5" fontWeight="bold" color="$gray11">
              Client
            </Text>

            <Controller
              control={control}
              name="customer"
              rules={{ required: 'Le client est requis' }}
              render={({ field: { onChange, value } }) => (
                <>
                  <SearchClient
                    testID="customer-search"
                    selectedCustomer={value}
                    onCustomerSelect={onChange}
                  />
                  {errors.customer && (
                    <Text testID="customer-error" color="$red10">
                      {errors.customer.message}
                    </Text>
                  )}
                </>
              )}
            />
          </YStack>

          <YStack gap="$4">
            <Text fontSize="$5" fontWeight="bold" color="$gray11">
              Produits
            </Text>

            <Controller
              control={control}
              name="products"
              rules={{
                validate: (value) =>
                  value.length > 0 || 'Au moins un produit est requis',
              }}
              render={({ field: { value } }) => (
                <>
                  <SearchProduct
                    testID="product-search"
                    selectedProducts={value}
                    onProductSelect={handleProductSelect}
                    onProductRemove={handleProductRemove}
                    onQuantityChange={handleQuantityChange}
                  />
                  {errors.products && (
                    <Text testID="products-error" color="$red10">
                      {errors.products.message}
                    </Text>
                  )}
                </>
              )}
            />
          </YStack>

          <YStack gap="$4">
            <Text fontSize="$5" fontWeight="bold" color="$gray11">
              Date limite de paiement
            </Text>

            <Controller
              control={control}
              name="dueDate"
              rules={{ required: 'La date limite est requise' }}
              render={({ field: { onChange, value } }) => (
                <>
                  <DateInput
                    testID="due-date-input"
                    value={value}
                    onChange={onChange}
                    placeholder="Sélectionner une date limite"
                  />
                  {errors.dueDate && (
                    <Text testID="due-date-error" color="$red10">
                      {errors.dueDate.message}
                    </Text>
                  )}
                </>
              )}
            />
          </YStack>

          <YStack gap="$4">
            <Text fontSize="$5" fontWeight="bold" color="$gray11">
              Récapitulatif
            </Text>

            <YStack
              testID="summary-container"
              backgroundColor="white"
              padding="$4"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$gray5"
              gap="$3"
            >
              <XStack justifyContent="space-between">
                <Text color="$gray11">Sous-total</Text>
                <Text testID="subtotal" fontWeight="bold">
                  {totals.subtotal} €
                </Text>
              </XStack>

              <XStack justifyContent="space-between">
                <Text color="$gray11">TVA</Text>
                <Text testID="tva" fontWeight="bold">
                  {totals.tva} €
                </Text>
              </XStack>

              <Separator />

              <XStack justifyContent="space-between">
                <Text fontSize="$5" fontWeight="bold" color="$gray11">
                  Total TTC
                </Text>
                <Text
                  testID="total"
                  fontSize="$5"
                  fontWeight="bold"
                  color="$blue10"
                >
                  {totals.total} €
                </Text>
              </XStack>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      <XStack
        paddingVertical="$4"
        paddingBottom="$7"
        backgroundColor="white"
        borderTopWidth={1}
        borderTopColor="$gray5"
        paddingHorizontal="$4"
      >
        <XStack flex={1}>
          <Button
            testID="save-draft-button"
            flex={1}
            backgroundColor={watch('customer') ? '$orange5' : '$gray5'}
            color={watch('customer') ? '$orange10' : '$gray10'}
            onPress={() =>
              onSaveDraft({
                customer: watch('customer'),
                products: watch('products'),
                dueDate: watch('dueDate'),
              })
            }
            disabled={!watch('customer') || isSubmitting}
            icon={Save}
            size="$5"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          {!invoiceId && (
            <FinalizeButton
              testID="finalize-button"
              isPending={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          )}
        </XStack>
      </XStack>
    </YStack>
  )
}
