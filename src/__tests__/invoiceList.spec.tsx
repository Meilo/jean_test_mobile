import React from 'react'

import {
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from '@testing-library/react-native'

import { InvoiceList } from '../screens/InvoiceList'

import { inMemoryInvoices } from '../fixtures/inMemoryInvoices'
import { mockUseApi, renderWithProviders } from '../services/testConfig'

describe('InvoiceList', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseApi.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: inMemoryInvoices }),
    } as any)
  })

  it('should render the title and basic elements', async () => {
    const { unmount } = renderWithProviders(<InvoiceList />, 'InvoiceList')

    await waitFor(() => {
      expect(screen.getByText('Factures')).toBeTruthy()
      expect(screen.getByTestId('invoice-list')).toBeTruthy()
      expect(screen.getByTestId('add-invoice-button')).toBeTruthy()
    })

    unmount()
  })

  it('should allow searching invoices', async () => {
    const { unmount } = renderWithProviders(<InvoiceList />, 'InvoiceList')

    const searchInput = screen.getByTestId('search-input')

    await act(async () => {
      fireEvent.changeText(searchInput, 'Dupont')
    })

    await waitFor(() => {
      expect(searchInput.props.value).toBe('Dupont')
      expect(mockUseApi().get).toHaveBeenCalledWith(
        expect.stringContaining('customer.last_name'),
      )
    })

    unmount()
  })

  it('should allow filtering invoices', async () => {
    const { unmount } = renderWithProviders(<InvoiceList />, 'InvoiceList')

    const filterChips = screen.getByTestId('filter-chips')

    await waitFor(() => {
      expect(filterChips).toBeTruthy()

      expect(screen.getByText('Payées')).toBeTruthy()
      expect(screen.getByText('Finalisées')).toBeTruthy()
      expect(screen.getByText('Brouillons')).toBeTruthy()
    })

    await act(async () => {
      fireEvent.press(screen.getByText('Payées'))
    })

    await waitFor(() => {
      expect(mockUseApi().get).toHaveBeenCalledWith(
        expect.stringContaining('paid'),
      )
    })

    unmount()
  })

  it('should show loading state', async () => {
    mockUseApi.mockReturnValue({
      get: jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        ),
    } as any)

    const { unmount } = renderWithProviders(<InvoiceList />, 'InvoiceList')

    await waitFor(() => {
      expect(screen.getByText('Chargement...')).toBeTruthy()
    })

    unmount()
  })

  it('should show empty state when no invoices', async () => {
    mockUseApi.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: {
          invoices: [],
          pagination: {
            total_pages: 1,
            current_page: 1,
          },
        },
      }),
    } as any)

    const { unmount } = renderWithProviders(<InvoiceList />, 'InvoiceList')

    await waitFor(() => {
      expect(screen.getByText('Aucune facture trouvée')).toBeTruthy()
    })

    unmount()
  })

  it('should show error state when API fails', async () => {
    mockUseApi.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('API Error')),
    } as any)

    const { unmount } = renderWithProviders(<InvoiceList />, 'InvoiceList')

    await waitFor(() => {
      expect(
        screen.getByText(
          'Une erreur est survenue lors du chargement des factures',
        ),
      ).toBeTruthy()
    })

    unmount()
  })

  it('should display correct status labels for the first invoice', async () => {
    const { unmount } = renderWithProviders(<InvoiceList />, 'InvoiceList')

    await waitFor(() => {
      const statusLabels = screen.getAllByTestId('invoice-status-label')
      const firstInvoiceLabels = statusLabels.slice(0, 2)
      const firstLabel = within(firstInvoiceLabels[0])
      const secondLabel = within(firstInvoiceLabels[1])

      expect(firstInvoiceLabels).toHaveLength(2)
      expect(statusLabels.length).toBeGreaterThan(0)
      expect(firstLabel.getByText(/^(Payée|Non payée)$/)).toBeTruthy()
      expect(secondLabel.getByText(/^(Finalisée|Brouillon)$/)).toBeTruthy()
    })

    unmount()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
