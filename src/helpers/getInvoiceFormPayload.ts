import { InvoiceFormData } from 'screens/InvoiceForm'

export interface InvoiceFormLine {
  id: number
  productId: number
  label: string
  unit: string
  vatRate: string
  price: string
}

export const getInvoiceFormPayload = ({
  data,
  finalized = false,
  deletedLineIds,
  invoiceId,
}: {
  data: InvoiceFormData
  finalized?: boolean
  deletedLineIds: InvoiceFormLine[]
  invoiceId?: number
}) => {
  const basePayload = {
    customer_id: data.customer?.id,
    finalized,
    paid: false,
    deadline: data.dueDate,
    date: new Date().toISOString().split('T')[0],
    invoice_lines_attributes: [
      ...data.products.map((product) => {
        const unitPrice = parseFloat(product.unit_price)
        const quantity = product.quantity
        const vatRate = parseFloat(product.vat_rate) / 100
        const totalWithoutVat = unitPrice * quantity
        const tax = totalWithoutVat * vatRate

        return {
          ...(product.invoice_line_id ? { id: product.invoice_line_id } : {}),
          product_id: product.id,
          quantity: product.quantity,
          label: product.label,
          unit: product.unit,
          vat_rate: (vatRate * 100).toString(),
          price: unitPrice.toString(),
          tax: tax.toFixed(2),
        }
      }),
      ...deletedLineIds.map(
        ({ id, productId, label, unit, vatRate, price }) => ({
          id,
          _destroy: true,
          product_id: productId,
          quantity: 0,
          label,
          unit,
          vat_rate: parseFloat(vatRate).toString(),
          price: parseFloat(price),
          tax: '0.00',
        }),
      ),
    ],
  }

  if (invoiceId) return { ...basePayload, id: invoiceId }

  return basePayload
}
