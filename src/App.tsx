import React from 'react'
import { UIProvider } from './ui/config'
import { ApiProvider } from './api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RootStackNavigation from './RootStackNavigation'

const queryClient = new QueryClient()
/**
 * API token to authenticate requests
 * provided by email.
 */
const API_TOKEN = ''

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider url="https://jean-test-api.herokuapp.com/" token={API_TOKEN}>
        <UIProvider>
          <RootStackNavigation />
        </UIProvider>
      </ApiProvider>
    </QueryClientProvider>
  )
}

export default App
