import React from 'react'
import { XStack, Button, Text, AnimatePresence } from 'tamagui'
import { CreditCard, FileCheck, FileEdit } from '@tamagui/lucide-icons'

export type FilterStatus = 'paid' | 'finalized' | 'draft' | null

interface FilterChipsProps {
  selectedFilters: FilterStatus[]
  onToggleFilter: (filter: FilterStatus) => void
  testID?: string
}

interface FilterChip {
  value: FilterStatus
  label: string
  color: string
  activeColor: string
  icon: React.ElementType
  count?: number
}

const FILTER_CHIPS: FilterChip[] = [
  {
    value: 'paid',
    label: 'Payées',
    color: '$green3',
    activeColor: '$green10',
    icon: CreditCard,
  },
  {
    value: 'finalized',
    label: 'Finalisées',
    color: '$blue3',
    activeColor: '$blue10',
    icon: FileCheck,
  },
  {
    value: 'draft',
    label: 'Brouillons',
    color: '$gray3',
    activeColor: '$gray10',
    icon: FileEdit,
  },
]

export const FilterChips = ({
  selectedFilters,
  onToggleFilter,
  testID,
}: FilterChipsProps) => {
  return (
    <XStack flexWrap="wrap" gap="$3" marginVertical="$2" testID={testID}>
      <AnimatePresence>
        {FILTER_CHIPS.map((chip) => {
          const isSelected = selectedFilters.includes(chip.value)
          const Icon = chip.icon
          return (
            <Button
              key={chip.value}
              animation="quick"
              onPress={() => onToggleFilter(chip.value)}
              padding="$2"
              paddingHorizontal="$3"
              marginVertical="$1"
              borderRadius="$10"
              borderWidth={1}
              backgroundColor={isSelected ? chip.color : '$gray5'}
              borderColor={isSelected ? chip.activeColor : '$gray5'}
            >
              <XStack gap="$2" alignItems="center" animation="quick">
                <Icon
                  size={16}
                  color={isSelected ? chip.activeColor : '$gray10'}
                />
                <Text
                  color={isSelected ? chip.activeColor : '$gray11'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  animation="quick"
                >
                  {chip.label}
                </Text>
              </XStack>
            </Button>
          )
        })}
      </AnimatePresence>
    </XStack>
  )
}
