import React from 'react'
import { Card, Circle, H5, Text, XStack, YStack, Separator } from 'tamagui'
import { FileText } from '@tamagui/lucide-icons'
import { Paths } from 'api/generated/client'

type Invoice = Paths.GetInvoices.Responses.$200['invoices'][0]

interface InvoiceLinesProps {
  invoice: Invoice
  testID?: string
}

export const InvoiceLines = ({ invoice, testID }: InvoiceLinesProps) => (
  <Card testID={testID} backgroundColor="white" padding="$4" bordered>
    <YStack gap="$4">
      <XStack alignItems="center" gap="$2">
        <Circle size={40} backgroundColor="$blue4">
          <FileText size={24} color="$blue10" />
        </Circle>
        <H5>Détails</H5>
      </XStack>
      <Separator />
      <YStack gap="$3">
        {invoice.invoice_lines.length > 0 ? (
          invoice.invoice_lines.map((line, index) => (
            <React.Fragment key={line.id}>
              {index > 0 && <Separator />}
              <YStack gap="$2" paddingVertical="$2">
                <Text fontSize="$4" fontWeight="bold">
                  {line.label}
                </Text>
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$2" alignItems="center">
                    <Text fontSize="$3" color="$gray11">
                      Quantité: {line.quantity}
                    </Text>
                    <Text fontSize="$3" color="$gray11">
                      •
                    </Text>
                    <Text fontSize="$3" color="$gray11">
                      Prix total:{' '}
                      {(Number(line.price) * line.quantity).toFixed(2)}€
                    </Text>
                  </XStack>
                  <Text fontSize="$4" fontWeight="bold" color="$blue10">
                    {line.price}€
                  </Text>
                </XStack>
              </YStack>
            </React.Fragment>
          ))
        ) : (
          <Text color="$gray11">Aucune ligne de facture</Text>
        )}
      </YStack>
    </YStack>
  </Card>
)
