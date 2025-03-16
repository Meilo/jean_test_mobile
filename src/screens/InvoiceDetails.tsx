import React from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import { YStack, Spinner, ScrollView, Text, XStack, Button } from 'tamagui'
import { Pencil } from '@tamagui/lucide-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import {
  InvoiceHeader,
  CustomerInfo,
  InvoiceDates,
  InvoiceLines,
  InvoiceSummary,
  FinalizeButton,
  PayButton,
  DeleteInvoiceButton,
} from '../components'
import { useInvoice } from '../hooks/useInvoice'

type RootStackParamList = {
  InvoiceForm: { invoiceId: number } | undefined
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

type RouteParams = {
  invoiceId: string
}

export const InvoiceDetails = () => {
  const route = useRoute()
  const navigation = useNavigation<NavigationProp>()
  const params = route.params as RouteParams
  const {
    data,
    isLoading,
    error,
    finalizeInvoiceMutation,
    payInvoiceMutation,
    deleteInvoiceMutation,
  } = useInvoice({
    invoiceId: params.invoiceId,
    goBack: () => navigation.goBack(),
  })

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner testID="loading-spinner" size="large" color="$blue10" />
      </YStack>
    )
  }

  if (error || !data) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text
          testID="error-message"
          color="$red10"
          textAlign="center"
          fontSize="$5"
        >
          Une erreur est survenue lors du chargement de la facture
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1}>
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$6">
          <InvoiceHeader testID="invoice-header" invoice={data} />
          <CustomerInfo testID="customer-info" invoice={data} />
          <InvoiceDates testID="invoice-dates" invoice={data} />
          <InvoiceLines testID="invoice-lines" invoice={data} />
          <InvoiceSummary testID="invoice-summary" invoice={data} />
          {!data.finalized && (
            <Button
              testID="edit-button"
              icon={Pencil}
              onPress={() =>
                navigation.navigate('InvoiceForm', {
                  invoiceId: Number(params.invoiceId),
                })
              }
              size="$5"
              flex={1}
              backgroundColor="$blue5"
              pressStyle={{ opacity: 0.7 }}
            >
              Modifier
            </Button>
          )}
        </YStack>
      </ScrollView>

      {!data.paid && (
        <XStack
          paddingVertical="$4"
          paddingBottom="$7"
          backgroundColor="white"
          borderTopWidth={1}
          borderTopColor="$gray5"
          paddingRight="$4"
        >
          <XStack flex={1} gap="$4">
            {!data.finalized && (
              <XStack flex={1} gap="$4">
                <FinalizeButton
                  testID="finalize-button"
                  isPending={finalizeInvoiceMutation.isPending}
                  onPress={() => finalizeInvoiceMutation.mutate()}
                />
                <DeleteInvoiceButton
                  testID="delete-button"
                  isPending={deleteInvoiceMutation.isPending}
                  onPress={() => deleteInvoiceMutation.mutate()}
                />
              </XStack>
            )}
            {!data.paid && data.finalized && (
              <PayButton
                testID="pay-button"
                isPending={payInvoiceMutation.isPending}
                onPress={() => payInvoiceMutation.mutate()}
              />
            )}
          </XStack>
        </XStack>
      )}
    </YStack>
  )
}

export default InvoiceDetails
