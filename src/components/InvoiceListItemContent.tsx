import React from 'react'
import { Text, XStack, YStack, Separator } from 'tamagui'
import { Calendar, FileText } from '@tamagui/lucide-icons'
import { Paths } from 'api/generated/client'
import { CustomerAvatar } from './CustomerAvatar'
import { StatusBadge, getStatusLabel } from './StatusBadge'

interface InvoiceListItemContentProps {
  invoice: Paths.GetInvoices.Responses.$200['invoices'][0]
}

export const InvoiceListItemContent = ({
  invoice,
}: InvoiceListItemContentProps) => (
  <YStack gap="$3">
    <XStack justifyContent="space-between" alignItems="flex-start">
      <XStack gap="$2" alignItems="center" flex={1}>
        <CustomerAvatar size={36} iconSize={20} />
        <YStack>
          <Text fontSize="$4" fontWeight="bold" numberOfLines={1}>
            {invoice.customer?.first_name} {invoice.customer?.last_name}
          </Text>
          <Text fontSize="$3" color="$gray11">
            #{invoice.id}
          </Text>
        </YStack>
      </XStack>
      <YStack alignItems="flex-end">
        <Text fontSize="$5" fontWeight="bold" color="$blue10">
          {(Number(invoice.total) + Number(invoice.tax)).toFixed(2)} €
        </Text>
      </YStack>
    </XStack>

    <Separator />

    <XStack justifyContent="space-between" alignItems="center">
      <XStack gap="$3" alignItems="center">
        <XStack gap="$1" alignItems="center">
          <Calendar size={14} color="$gray11" />
          <Text fontSize="$2" color="$gray11">
            {invoice.date}
          </Text>
        </XStack>
        <XStack gap="$1" alignItems="center">
          <FileText size={14} color="$gray11" />
          <Text fontSize="$2" color="$gray11">
            {invoice.invoice_lines.length} ligne
            {invoice.invoice_lines.length > 1 ? 's' : ''}
          </Text>
        </XStack>
      </XStack>
      <XStack gap="$2">
        {invoice.finalized && (
          <StatusBadge
            status={invoice.paid ? 'paid' : 'unpaid'}
            label={getStatusLabel(invoice.paid ? 'paid' : 'unpaid')}
            size="small"
          />
        )}
        <StatusBadge
          status={invoice.finalized ? 'finalized' : 'draft'}
          label={getStatusLabel(invoice.finalized ? 'finalized' : 'draft')}
          size="small"
        />
      </XStack>
    </XStack>
  </YStack>
)
