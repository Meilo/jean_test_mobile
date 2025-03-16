import React from 'react'
import { Card, Stack } from 'tamagui'
import { Paths } from 'api/generated/client'
import { InvoiceListItemContent } from '.'

interface InvoiceListItemProps {
  invoice: Paths.GetInvoices.Responses.$200['invoices'][0]
  onPress: () => void
}

export const InvoiceListItem = ({ invoice, onPress }: InvoiceListItemProps) => (
  <Stack onPress={onPress} pressStyle={{ opacity: 0.7 }}>
    <Card backgroundColor="white" padding="$4" bordered>
      <InvoiceListItemContent invoice={invoice} />
    </Card>
  </Stack>
)
