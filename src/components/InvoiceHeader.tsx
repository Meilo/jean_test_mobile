import React from 'react'
import { Card, H4, Text, XStack, YStack, Separator } from 'tamagui'
import { getStatusLabel, StatusBadge } from './StatusBadge'
import { Paths } from 'api/generated/client'

type Invoice = Paths.GetInvoices.Responses.$200['invoices'][0]

interface InvoiceHeaderProps {
  invoice: Invoice
  testID?: string
}

export const InvoiceHeader = ({ invoice, testID }: InvoiceHeaderProps) => (
  <Card testID={testID} backgroundColor="$blue2" padding="$4" bordered>
    <YStack gap="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <H4>Facture #{invoice.id}</H4>
        <StatusBadge
          status={invoice.finalized ? 'finalized' : 'draft'}
          label={getStatusLabel(invoice.finalized ? 'finalized' : 'draft')}
        />
      </XStack>
      <Separator />
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$6" fontWeight="bold" color="$blue10">
          {(Number(invoice.total) + Number(invoice.tax)).toFixed(2)} €
        </Text>
        {invoice.finalized && (
          <StatusBadge
            status={invoice.paid ? 'paid' : 'unpaid'}
            label={getStatusLabel(invoice.paid ? 'paid' : 'unpaid')}
          />
        )}
      </XStack>
    </YStack>
  </Card>
)
