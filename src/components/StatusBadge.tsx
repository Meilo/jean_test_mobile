import React from 'react'
import { Text, XStack } from 'tamagui'

export type InvoiceStatus = 'unpaid' | 'paid' | 'finalized' | 'draft'

export const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case 'unpaid':
      return '$red10'
    case 'paid':
      return '$green10'
    case 'finalized':
      return '$blue10'
    case 'draft':
      return '$gray10'
    default:
      return '$gray10'
  }
}

export const getStatusLabel = (status: InvoiceStatus) => {
  switch (status) {
    case 'unpaid':
      return 'Non payée'
    case 'paid':
      return 'Payée'
    case 'finalized':
      return 'Finalisée'
    case 'draft':
      return 'Brouillon'
    default:
      return status
  }
}

interface StatusBadgeProps {
  status: InvoiceStatus
  label: string
  size?: 'small' | 'normal'
}

export const StatusBadge = ({
  status,
  label,
  size = 'normal',
}: StatusBadgeProps) => (
  <XStack
    backgroundColor={getStatusColor(status)}
    paddingHorizontal={size === 'small' ? '$2' : '$3'}
    paddingVertical={size === 'small' ? '$1' : '$2'}
    borderRadius="$4"
    testID="invoice-status-label"
  >
    <Text
      color="white"
      fontSize={size === 'small' ? '$2' : '$3'}
      fontWeight="bold"
    >
      {label}
    </Text>
  </XStack>
)
