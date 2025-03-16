import React from 'react'
import { Card, Circle, H5, Text, XStack, YStack, Separator } from 'tamagui'
import { Paths } from 'api/generated/client'
import { User, MapPin, Building2 } from '@tamagui/lucide-icons'

type Invoice = Paths.GetInvoices.Responses.$200['invoices'][0]

interface CustomerInfoProps {
  invoice: Invoice
  testID?: string
}

export const CustomerInfo = ({ invoice, testID }: CustomerInfoProps) => (
  <Card testID={testID} backgroundColor="white" padding="$4" bordered>
    <YStack gap="$4">
      <XStack alignItems="center" gap="$2">
        <Circle size={40} backgroundColor="$blue4">
          <User size={24} color="$blue10" />
        </Circle>
        <H5>Client</H5>
      </XStack>
      <Separator />
      {invoice.customer && (
        <YStack gap="$3">
          <YStack gap="$2" paddingVertical="$2">
            <XStack alignItems="center" gap="$2">
              <Building2 size={16} color="$gray11" />
              <Text fontSize="$4" fontWeight="bold">
                {invoice.customer.first_name} {invoice.customer.last_name}
              </Text>
            </XStack>
            <XStack alignItems="center" gap="$2">
              <MapPin size={16} color="$gray11" />
              <Text fontSize="$3" color="$gray11">
                {invoice.customer.address}
              </Text>
            </XStack>
            <XStack alignItems="center" gap="$2">
              <MapPin size={16} color="$gray11" />
              <Text fontSize="$3" color="$gray11">
                {invoice.customer.zip_code} {invoice.customer.city}
              </Text>
            </XStack>
            <XStack alignItems="center" gap="$2">
              <MapPin size={16} color="$gray11" />
              <Text fontSize="$3" color="$gray11">
                {invoice.customer.country}
              </Text>
            </XStack>
          </YStack>
        </YStack>
      )}
    </YStack>
  </Card>
)
