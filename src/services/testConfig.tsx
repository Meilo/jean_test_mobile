import React from 'react'
import { render } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { UIProvider } from '../ui/config'
import { ApiProvider, useApi } from '../api'

export const mockUseApi = useApi as jest.MockedFunction<typeof useApi>

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  })

const Stack = createNativeStackNavigator()

export const renderWithProviders = (ui: React.ReactElement, name: string) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      <ApiProvider url="http://test-api.com" token="test-token">
        <UIProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name={name}>{() => ui}</Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </UIProvider>
      </ApiProvider>
    </QueryClientProvider>,
  )
}
