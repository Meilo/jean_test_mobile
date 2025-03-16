import React from 'react'
import { Button, Spinner } from 'tamagui'
import { CreditCard } from '@tamagui/lucide-icons'

interface PayButtonProps {
  isPending: boolean
  onPress: () => void
  testID?: string
}

export const PayButton = ({ isPending, onPress, testID }: PayButtonProps) => (
  <Button
    testID={testID}
    backgroundColor="$green10"
    color="white"
    pressStyle={{ backgroundColor: '$green9' }}
    onPress={onPress}
    disabled={isPending}
    icon={CreditCard}
    size="$5"
    marginLeft="$4"
    flex={1}
  >
    {isPending ? <Spinner color="white" /> : 'Marquer comme payée'}
  </Button>
)
