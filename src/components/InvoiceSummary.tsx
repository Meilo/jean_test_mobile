import React from 'react'
import { Card, Circle, H5, Text, XStack, YStack, Separator } from 'tamagui'
import { Paths } from 'api/generated/client'
import { Receipt, Calculator } from '@tamagui/lucide-icons'

type Invoice = Paths.GetInvoices.Responses.$200['invoices'][0]

interface InvoiceSummaryProps {
  invoice: Invoice
  testID?: string
}

export const InvoiceSummary = ({ invoice, testID }: InvoiceSummaryProps) => (
  <Card testID={testID} backgroundColor="white" padding="$4" bordered>
    <YStack gap="$4">
      <XStack alignItems="center" gap="$2">
        <Circle size={40} backgroundColor="$blue4">
          <Receipt size={24} color="$blue10" />
        </Circle>
        <H5>Récapitulatif</H5>
      </XStack>
      <Separator />
      <YStack gap="$3">
        {invoice.total && (
          <YStack gap="$2" paddingVertical="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$2">
                <Calculator size={16} color="$gray11" />
                <Text fontSize="$3" color="$gray11">
                  Total HT
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$1">
                <Text fontSize="$4" fontWeight="bold" color="black">
                  {Number(invoice.total).toFixed(2)} €
                </Text>
              </XStack>
            </XStack>
          </YStack>
        )}
        {invoice.tax && (
          <YStack gap="$2" paddingVertical="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$2">
                <Calculator size={16} color="$gray11" />
                <Text fontSize="$3" color="$gray11">
                  TVA
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$1">
                <Text fontSize="$4" fontWeight="bold" color="black">
                  {Number(invoice.tax).toFixed(2)} €
                </Text>
              </XStack>
            </XStack>
          </YStack>
        )}
        {invoice.total && invoice.tax && (
          <>
            <Separator />
            <YStack gap="$2" paddingVertical="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$2">
                  <Receipt size={16} color="$blue10" />
                  <Text fontSize="$4" fontWeight="bold" color="$blue10">
                    Total TTC
                  </Text>
                </XStack>
                <XStack alignItems="center" gap="$1">
                  <Text fontSize="$4" fontWeight="bold" color="$blue10">
                    {(Number(invoice.total) + Number(invoice.tax)).toFixed(2)} €
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          </>
        )}
      </YStack>
    </YStack>
  </Card>
)
