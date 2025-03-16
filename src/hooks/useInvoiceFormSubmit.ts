import { useNavigation, useRoute } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { useQueryClient, useMutation } from '@tanstack/react-query'

import { useApi } from '../api'
import { Paths } from '../api/generated/client'
import {
  getInvoiceFormPayload,
  InvoiceFormLine,
} from '../helpers/getInvoiceFormPayload'

type Customer = Paths.GetSearchCustomers.Responses.$200['customers'][0]
type Product = Paths.GetSearchProducts.Responses.$200['products'][0]
type InvoiceCreatePayload = Paths.PostInvoices.RequestBody['invoice']
type InvoiceUpdatePayload = Paths.PutInvoice.RequestBody['invoice']

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

export const useInvoiceFormSubmit = () => {
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const api = useApi()
  const route = useRoute()
  const { invoiceId } = (route.params as RouteParams) || {}
  const [deletedLineIds, setDeletedLineIds] = useState<InvoiceFormLine[]>([])

  const showMessage = useCallback(
    (type: 'success' | 'error', message: string) => {
      Alert.alert(type, message)
    },
    [],
  )

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const payload = getInvoiceFormPayload({
        data,
        finalized: true,
        deletedLineIds,
        invoiceId: invoiceId || undefined,
      })
      const invoice = payload as InvoiceCreatePayload
      return api.postInvoices(null, { invoice })
    },
    onSuccess: () => {
      navigation.goBack()
    },
    onError: (error) => {
      console.error('Error submitting form:', error)
      showMessage('error', 'Erreur lors de la sauvegarde de la facture')
    },
  })

  const createDraftMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const payload = getInvoiceFormPayload({
        data,
        finalized: false,
        deletedLineIds,
        invoiceId: invoiceId || undefined,
      })
      const invoice = payload as InvoiceCreatePayload
      return api.postInvoices(null, { invoice })
    },
    onSuccess: () => {
      navigation.goBack()
    },
    onError: (error) => {
      console.error('Error saving draft:', error)
      showMessage('error', 'Erreur lors de la sauvegarde du brouillon')
    },
  })

  const updateDraftMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const payload = getInvoiceFormPayload({
        data,
        finalized: false,
        deletedLineIds,
        invoiceId: invoiceId || undefined,
      })
      const invoice = payload as InvoiceUpdatePayload
      return api.putInvoice({ id: invoiceId! }, { invoice })
    },
    onSuccess: () => {
      setDeletedLineIds([])
      navigation.goBack()
      queryClient.invalidateQueries({
        queryKey: ['invoice', String(invoiceId)],
      })
    },
    onError: (error) => {
      console.error('Error saving draft:', error)
      showMessage('error', 'Erreur lors de la sauvegarde du brouillon')
    },
  })

  const onSubmit = useCallback(
    async (data: InvoiceFormData) => {
      await createInvoiceMutation.mutateAsync(data)
    },
    [createInvoiceMutation],
  )

  const onSaveDraft = useCallback(
    async (data: InvoiceFormData) => {
      if (invoiceId) {
        await updateDraftMutation.mutateAsync(data)
      } else {
        await createDraftMutation.mutateAsync(data)
      }
    },
    [invoiceId, createDraftMutation, updateDraftMutation],
  )

  return {
    onSubmit,
    onSaveDraft,
    setDeletedLineIds,
  }
}
