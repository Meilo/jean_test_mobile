import React from 'react'
import { Card, Circle, Text, XStack, YStack, Separator } from 'tamagui'
import { Calendar } from '@tamagui/lucide-icons'
import { Paths } from 'api/generated/client'

type Invoice = Paths.GetInvoices.Responses.$200['invoices'][0]

interface InvoiceDatesProps {
  invoice: Invoice
  testID?: string
}

export const InvoiceDates = ({ invoice, testID }: InvoiceDatesProps) => (
  <Card testID={testID} backgroundColor="white" padding="$4" bordered elevate>
    <YStack gap="$4">
      <XStack alignItems="center" gap="$2">
        <Circle size={40} backgroundColor="$blue4">
          <Calendar size={24} color="$blue10" />
        </Circle>
        <YStack gap="$2" flex={1}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$4" fontWeight="bold">
              Date d&apos;émission
            </Text>
            <Text fontSize="$4">{invoice.date}</Text>
          </XStack>
          <Separator />
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$4" fontWeight="bold">
              Date limite
            </Text>
            <Text fontSize="$4">{invoice.deadline || '-'}</Text>
          </XStack>
        </YStack>
      </XStack>
    </YStack>
  </Card>
)
