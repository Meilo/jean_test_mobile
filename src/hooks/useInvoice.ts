import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../api'
import type { Paths } from '../api/generated/client'

type Invoice = Paths.GetInvoices.Responses.$200['invoices'][0]

export const useInvoice = ({
  invoiceId,
  goBack,
}: {
  invoiceId: string
  goBack: () => void
}) => {
  const api = useApi()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<Invoice>({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await api.getInvoice(Number(invoiceId))
      return response.data
    },
  })

  const finalizeInvoiceMutation = useMutation({
    mutationFn: async () => {
      await api.putInvoice(Number(invoiceId), {
        invoice: {
          id: Number(invoiceId),
          finalized: true,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
    },
  })

  const payInvoiceMutation = useMutation({
    mutationFn: async () => {
      await api.putInvoice(Number(invoiceId), {
        invoice: {
          id: Number(invoiceId),
          paid: true,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
    },
  })

  const deleteInvoiceMutation = useMutation({
    mutationFn: async () => {
      await api.deleteInvoice(Number(invoiceId))
    },
    onSuccess: () => {
      goBack()
    },
    onError: (error) => {
      console.error('Error deleting invoice', error)
    },
  })

  return {
    data,
    isLoading,
    error,
    finalizeInvoiceMutation,
    payInvoiceMutation,
    deleteInvoiceMutation,
  }
}
