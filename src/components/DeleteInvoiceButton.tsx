import React, { useState } from 'react'
import { Button, Sheet, Text, XStack, YStack } from 'tamagui'
import { Trash2 } from '@tamagui/lucide-icons'

interface DeleteInvoiceButtonProps {
  isPending: boolean
  onPress: () => void
  testID?: string
}

export const DeleteInvoiceButton = ({
  isPending,
  onPress,
  testID,
}: DeleteInvoiceButtonProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <>
      <Button
        testID={testID}
        icon={Trash2}
        backgroundColor="$red10"
        color="white"
        pressStyle={{ backgroundColor: '$red9' }}
        onPress={() => setIsDeleteDialogOpen(true)}
        disabled={isPending}
        size="$5"
        flex={1}
      >
        Supprimer
      </Button>

      <Sheet
        modal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        snapPoints={[30]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <YStack gap="$4">
            <Text fontSize="$6" fontWeight="bold">
              Supprimer la facture
            </Text>
            <Text color="$gray11">
              Êtes-vous sûr de vouloir supprimer cette facture ? Cette action
              est irréversible.
            </Text>

            <XStack gap="$3" marginTop="$2">
              <Button
                flex={1}
                onPress={() => setIsDeleteDialogOpen(false)}
                backgroundColor="$gray5"
                size="$4"
                pressStyle={{ opacity: 0.7 }}
              >
                Annuler
              </Button>
              <Button
                testID="confirm-delete-button"
                flex={1}
                onPress={() => {
                  onPress()
                  setIsDeleteDialogOpen(false)
                }}
                backgroundColor="$red10"
                disabled={isPending}
                size="$4"
                pressStyle={{ opacity: 0.7 }}
              >
                {isPending ? 'Suppression...' : 'Supprimer'}
              </Button>
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
