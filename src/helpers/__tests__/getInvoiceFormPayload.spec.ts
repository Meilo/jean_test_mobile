import { describe, it, expect } from '@jest/globals'
import { getInvoiceFormPayload } from '../getInvoiceFormPayload'
import { InvoiceFormData } from 'screens/InvoiceForm'
import { Paths } from '../../api/generated/client'

describe('getInvoiceFormPayload', () => {
  const mockCustomer: Paths.GetSearchCustomers.Responses.$200['customers'][0] =
    {
      id: 1,
      first_name: 'Jean',
      last_name: 'Dupont',
      address: '9 impasse Sauvey',
      zip_code: '50100',
      city: 'Cherbourg',
      country: 'France',
      country_code: 'FR',
    }

  const mockProducts: Paths.GetSearchProducts.Responses.$200['products'][0][] =
    [
      {
        id: 1,
        label: 'Product 1',
        unit: 'piece' as const,
        vat_rate: '20' as const,
        unit_price: '100',
        unit_price_without_tax: '80',
        unit_tax: '20',
      },
    ]

  const mockFormData: InvoiceFormData = {
    customer: mockCustomer,
    products: mockProducts.map((product) => ({
      ...product,
      quantity: 2,
    })),
    dueDate: '2024-12-31',
  }

  const mockDeletedLines = [
    {
      id: 2,
      productId: 2,
      label: 'Deleted Product',
      unit: 'piece' as const,
      vatRate: '20',
      price: '50',
    },
  ]

  it('should generate a correct payload for a new invoice', () => {
    const result = getInvoiceFormPayload({
      data: mockFormData,
      deletedLineIds: [],
    })

    expect(result).toEqual({
      customer_id: 1,
      finalized: false,
      paid: false,
      deadline: '2024-12-31',
      date: expect.any(String),
      invoice_lines_attributes: [
        {
          product_id: 1,
          quantity: 2,
          label: 'Product 1',
          unit: 'piece',
          vat_rate: '20',
          price: '100',
          tax: '40.00',
        },
      ],
    })
  })

  it('should include deleted lines in the payload', () => {
    const result = getInvoiceFormPayload({
      data: mockFormData,
      deletedLineIds: mockDeletedLines,
    })

    expect(result.invoice_lines_attributes).toHaveLength(2)
    expect(result.invoice_lines_attributes[1]).toEqual({
      id: 2,
      _destroy: true,
      product_id: 2,
      quantity: 0,
      label: 'Deleted Product',
      unit: 'piece',
      vat_rate: '20',
      price: 50,
      tax: '0.00',
    })
  })

  it('should include the invoice ID if provided', () => {
    const result = getInvoiceFormPayload({
      data: mockFormData,
      deletedLineIds: [],
      invoiceId: 123,
    })

    expect(result).toHaveProperty('id', 123)
  })

  it('should calculate the tax correctly for each line', () => {
    const productsWithVat = [
      {
        id: 1,
        label: 'Product 1',
        unit: 'piece' as const,
        vat_rate: '20' as const,
        unit_price: '100',
        unit_price_without_tax: '80',
        unit_tax: '20',
      },
      {
        id: 2,
        label: 'Product 2',
        unit: 'piece' as const,
        vat_rate: '10' as const,
        unit_price: '50',
        unit_price_without_tax: '45',
        unit_tax: '5',
      },
    ]

    const result = getInvoiceFormPayload({
      data: {
        ...mockFormData,
        products: productsWithVat.map((product) => ({
          ...product,
          quantity: 2,
        })),
      },
      deletedLineIds: [],
    })

    expect(result.invoice_lines_attributes[0].tax).toBe('40.00') // 100 * 2 * 0.20
    expect(result.invoice_lines_attributes[1].tax).toBe('10.00') // 50 * 2 * 0.10
  })

  it('should handle the case where the invoice is finalized', () => {
    const result = getInvoiceFormPayload({
      data: mockFormData,
      deletedLineIds: [],
      finalized: true,
    })

    expect(result.finalized).toBe(true)
  })
})
