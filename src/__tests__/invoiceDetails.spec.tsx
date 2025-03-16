import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react-native'
import { useRoute, useNavigation } from '@react-navigation/native'

import { InvoiceDetails } from '../screens/InvoiceDetails'

import { inMemoryInvoice } from '../fixtures/inMemoryInvoice'
import { mockUseApi, renderWithProviders } from '../services/testConfig'

describe('InvoiceDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRoute as jest.Mock).mockReturnValue({
      params: {
        invoiceId: '5785',
      },
    })
    ;(useNavigation as jest.Mock).mockReturnValue({
      goBack: jest.fn(),
      navigate: jest.fn(),
    })
  })

  it('should display a loading spinner when the invoice is loading', () => {
    mockUseApi.mockReturnValue({
      getInvoice: jest.fn().mockImplementation(() => new Promise(() => {})),
    } as any)
    const { unmount } = renderWithProviders(
      <InvoiceDetails />,
      'InvoiceDetails',
    )

    expect(screen.getByTestId('loading-spinner')).toBeTruthy()

    unmount()
  })

  it('should display an error message when there is a problem loading the invoice', async () => {
    mockUseApi.mockReturnValue({
      getInvoice: jest
        .fn()
        .mockRejectedValue(new Error('Erreur de chargement')),
    } as any)
    const { unmount } = renderWithProviders(
      <InvoiceDetails />,
      'InvoiceDetails',
    )

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeTruthy()
    })

    unmount()
  })

  it('should display the invoice details correctly', async () => {
    mockUseApi.mockReturnValue({
      getInvoice: jest.fn().mockResolvedValue({ data: inMemoryInvoice }),
    } as any)
    const { unmount } = renderWithProviders(
      <InvoiceDetails />,
      'InvoiceDetails',
    )

    await waitFor(() => {
      expect(screen.getByTestId('invoice-header')).toBeTruthy()
      expect(screen.getByTestId('customer-info')).toBeTruthy()
      expect(screen.getByTestId('invoice-lines')).toBeTruthy()
      expect(screen.getByTestId('invoice-summary')).toBeTruthy()
    })

    unmount()
  })

  it('should allow to finalize an invoice', async () => {
    mockUseApi.mockReturnValue({
      getInvoice: jest.fn().mockResolvedValue({ data: inMemoryInvoice }),
      putInvoice: jest.fn(),
    } as any)

    const { unmount } = renderWithProviders(
      <InvoiceDetails />,
      'InvoiceDetails',
    )

    await waitFor(() => {
      expect(screen.getByTestId('finalize-button')).toBeTruthy()
    })

    fireEvent.press(screen.getByTestId('finalize-button'))

    await waitFor(() => {
      expect(mockUseApi().putInvoice).toHaveBeenCalledWith(5785, {
        invoice: {
          id: 5785,
          finalized: true,
        },
      })
    })

    unmount()
  })

  it('should allow to pay a finalized invoice', async () => {
    const finalizedInvoice = { ...inMemoryInvoice, finalized: true }
    mockUseApi.mockReturnValue({
      getInvoice: jest.fn().mockResolvedValue({ data: finalizedInvoice }),
      putInvoice: jest.fn(),
    } as any)

    const { unmount } = renderWithProviders(
      <InvoiceDetails />,
      'InvoiceDetails',
    )

    await waitFor(() => {
      expect(screen.getByTestId('pay-button')).toBeTruthy()
    })

    fireEvent.press(screen.getByTestId('pay-button'))

    await waitFor(() => {
      expect(mockUseApi().putInvoice).toHaveBeenCalledWith(5785, {
        invoice: {
          id: 5785,
          paid: true,
        },
      })
    })

    unmount()
  })

  it('should allow to delete an invoice', async () => {
    mockUseApi.mockReturnValue({
      getInvoice: jest.fn().mockResolvedValue({ data: inMemoryInvoice }),
      deleteInvoice: jest.fn(),
    } as any)

    const { unmount } = renderWithProviders(
      <InvoiceDetails />,
      'InvoiceDetails',
    )

    await waitFor(() => {
      expect(screen.getByTestId('invoice-header')).toBeTruthy()
    })

    const deleteButton = await screen.findByTestId('delete-button')
    expect(deleteButton).toBeTruthy()

    fireEvent.press(deleteButton)

    const confirmButton = await screen.findByTestId('confirm-delete-button')
    expect(confirmButton).toBeTruthy()
    fireEvent.press(confirmButton)

    await waitFor(() => {
      expect(mockUseApi().deleteInvoice).toHaveBeenCalledWith(5785)
    })

    unmount()
  })

  it('should allow to edit an invoice that is not finalized', async () => {
    const mockNavigate = jest.fn()
    ;(useNavigation as jest.Mock).mockReturnValue({
      goBack: jest.fn(),
      navigate: mockNavigate,
    })

    mockUseApi.mockReturnValue({
      getInvoice: jest.fn().mockResolvedValue({ data: inMemoryInvoice }),
    } as any)

    const { unmount } = renderWithProviders(
      <InvoiceDetails />,
      'InvoiceDetails',
    )

    await waitFor(() => {
      expect(screen.getByTestId('edit-button')).toBeTruthy()
    })

    fireEvent.press(screen.getByTestId('edit-button'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('InvoiceForm', {
        invoiceId: 5785,
      })
    })

    unmount()
  })
})
