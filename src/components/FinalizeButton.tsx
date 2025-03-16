import React from 'react'
import { Button, Spinner } from 'tamagui'
import { Check } from '@tamagui/lucide-icons'

interface FinalizeButtonProps {
  isPending: boolean
  onPress: () => void
  testID?: string
}

export const FinalizeButton = ({
  isPending,
  onPress,
  testID,
}: FinalizeButtonProps) => (
  <Button
    testID={testID}
    size="$5"
    backgroundColor="$green10"
    color="white"
    icon={isPending ? undefined : Check}
    onPress={onPress}
    disabled={isPending}
    flex={1}
    marginLeft="$4"
    pressStyle={{ opacity: 0.7 }}
  >
    {isPending ? <Spinner color="white" /> : 'Finaliser'}
  </Button>
)
