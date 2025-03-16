import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react-native'
import { useRoute, useNavigation } from '@react-navigation/native'

import { InvoiceForm } from '../screens/InvoiceForm'
import { mockUseApi, renderWithProviders } from '../services/testConfig'
import { useInvoiceFormSubmit } from '../hooks/useInvoiceFormSubmit'

jest.mock('../hooks/useInvoiceFormSubmit', () => ({
  useInvoiceFormSubmit: jest.fn(),
}))

describe('InvoiceForm', () => {
  const mockUseInvoiceFormSubmit = {
    onSaveDraft: jest.fn(),
    onSubmit: jest.fn(),
    setDeletedLineIds: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRoute as jest.Mock).mockReturnValue({ params: { invoiceId: '1' } })
    ;(useNavigation as jest.Mock).mockReturnValue({
      goBack: jest.fn(),
      navigate: jest.fn(),
    })
    ;(useInvoiceFormSubmit as jest.Mock).mockReturnValue(
      mockUseInvoiceFormSubmit,
    )
  })

  it('should display the form title "Nouvelle facture" by default', () => {
    ;(useRoute as jest.Mock).mockReturnValue({ params: {} })

    const { unmount } = renderWithProviders(<InvoiceForm />, 'InvoiceForm')

    expect(screen.getByTestId('form-title')).toHaveTextContent(
      'Nouvelle facture',
    )

    unmount()
  })

  it('should display the form title "Modifier la facture" when invoiceId is present', async () => {
    const { unmount } = renderWithProviders(<InvoiceForm />, 'InvoiceForm')

    await waitFor(() => {
      expect(screen.getByTestId('form-title')).toHaveTextContent(
        'Modifier la facture',
      )
    })

    unmount()
  })

  it('should display an error when the client is required', async () => {
    ;(useRoute as jest.Mock).mockReturnValue({ params: {} })
    const { unmount } = renderWithProviders(<InvoiceForm />, 'InvoiceForm')

    await waitFor(() => {
      expect(screen.getByTestId('finalize-button')).toBeTruthy()
    })

    const finalizeButton = screen.getByTestId('finalize-button')
    fireEvent.press(finalizeButton)

    await waitFor(() => {
      expect(screen.getByTestId('customer-error')).toBeTruthy()
    })

    unmount()
  })

  it('should calculate the totals correctly when a product is added', async () => {
    const mockProduct = {
      id: 1,
      label: 'Test Product',
      unit: 'unit',
      unit_price: '100',
      unit_tax: '20',
      vat_rate: '0.2',
    }

    mockUseApi.mockReturnValue({
      getSearchProducts: jest
        .fn()
        .mockResolvedValue({ data: { products: [mockProduct] } }),
    } as any)

    const { unmount } = renderWithProviders(<InvoiceForm />, 'InvoiceForm')

    await waitFor(() => {
      expect(screen.getByTestId('customer-search')).toBeTruthy()
    })

    const customerSearch = screen.getByTestId('customer-search')
    fireEvent.press(customerSearch)

    const productSearch = screen.getByTestId('product-search')
    fireEvent.press(productSearch)

    const searchInput = screen.getByPlaceholderText('Rechercher un produit...')
    fireEvent.changeText(searchInput, 'Test')

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeTruthy()
    })

    const productItem = screen.getByText('Test Product')
    fireEvent.press(productItem)

    const plusButton = screen.getByTestId('plus-button')
    fireEvent.press(plusButton)

    await waitFor(() => {
      expect(screen.getByTestId('subtotal')).toHaveTextContent('200.00 €')
      expect(screen.getByTestId('tva')).toHaveTextContent('40.00 €')
      expect(screen.getByTestId('total')).toHaveTextContent('240.00 €')
    })

    unmount()
  })

  it('should load the invoice data when invoiceId is present', async () => {
    mockUseApi.mockReturnValue({
      getInvoice: jest.fn().mockResolvedValue({
        data: {
          customer: { id: 1, name: 'Test Client' },
          invoice_lines: [
            {
              id: 1,
              product_id: 1,
              label: 'Test Product',
              unit: 'unit',
              price: '100',
              tax: '20',
              vat_rate: '0.2',
              quantity: 1,
            },
          ],
          deadline: '2024-12-31',
        },
      }),
    } as any)

    const { unmount } = renderWithProviders(<InvoiceForm />, 'InvoiceForm')

    await waitFor(() => {
      expect(mockUseApi().getInvoice).toHaveBeenCalledWith({ id: '1' })
    })

    unmount()
  })

  it('should call onSaveDraft when the save button is pressed', async () => {
    const { unmount } = renderWithProviders(<InvoiceForm />, 'InvoiceForm')

    await waitFor(() => {
      expect(screen.getByTestId('customer-search')).toBeTruthy()
    })

    const customerSearch = screen.getByTestId('customer-search')
    fireEvent.press(customerSearch)

    const productSearch = screen.getByTestId('product-search')
    fireEvent.press(productSearch)

    const dateInput = screen.getByTestId('due-date-input')
    fireEvent.changeText(dateInput, '2024-12-31')

    const saveButton = screen.getByTestId('save-draft-button')
    fireEvent.press(saveButton)

    await waitFor(() => {
      expect(mockUseInvoiceFormSubmit.onSaveDraft).toHaveBeenCalled()
    })

    unmount()
  })

  it('should call onSubmit when the form is validated', async () => {
    ;(useRoute as jest.Mock).mockReturnValue({ params: {} })

    mockUseApi.mockReturnValue({
      getSearchCustomers: jest.fn().mockResolvedValue({
        data: {
          customers: [{ id: 1, first_name: 'Test', last_name: 'Client' }],
        },
      }),
      getSearchProducts: jest.fn().mockResolvedValue({
        data: {
          products: [
            {
              id: 1,
              label: 'Test Product',
              unit_price: '100',
              vat_rate: '0.2',
            },
          ],
        },
      }),
    } as any)

    const { unmount } = renderWithProviders(<InvoiceForm />, 'InvoiceForm')

    await waitFor(() => {
      expect(screen.getByTestId('customer-search')).toBeTruthy()
    })

    const customerSearch = screen.getByTestId('customer-search')
    fireEvent.press(customerSearch)

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Rechercher un client...'),
      ).toBeTruthy()
    })

    fireEvent.changeText(
      screen.getByPlaceholderText('Rechercher un client...'),
      'Test',
    )

    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeTruthy()
    })

    fireEvent.press(screen.getByText('Test Client'))

    const productSearch = screen.getByTestId('product-search')
    fireEvent.press(productSearch)

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Rechercher un produit...'),
      ).toBeTruthy()
    })

    fireEvent.changeText(
      screen.getByPlaceholderText('Rechercher un produit...'),
      'Test',
    )

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeTruthy()
    })

    fireEvent.press(screen.getByText('Test Product'))

    const dateInput = screen.getByTestId('due-date-input')
    fireEvent.press(dateInput)

    await waitFor(() => {
      expect(screen.getByText('Sélectionner une date')).toBeTruthy()
    })

    const confirmButton = screen.getByText('Confirmer')
    fireEvent.press(confirmButton)

    await waitFor(() => {
      expect(screen.getByTestId('due-date-input')).toBeTruthy()
    })

    const finalizeButton = screen.getByTestId('finalize-button')
    fireEvent.press(finalizeButton)

    await waitFor(() => {
      expect(mockUseInvoiceFormSubmit.onSubmit).toHaveBeenCalled()
    })

    unmount()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
