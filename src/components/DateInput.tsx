import React, { useState, useEffect } from 'react'
import { Button, Sheet, Text, YStack } from 'tamagui'
import { Calendar } from '@tamagui/lucide-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  testID?: string
}

export const DateInput = ({
  value,
  onChange,
  placeholder,
  testID,
}: DateInputProps) => {
  const [open, setOpen] = useState(false)
  const [tempDate, setTempDate] = useState<Date>(
    value ? new Date(value) : new Date(),
  )

  useEffect(() => {
    setTempDate(value ? new Date(value) : new Date())
  }, [value])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setTempDate(value ? new Date(value) : new Date())
    }
  }

  const handleChange = (_: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate)
    }
  }

  const handleConfirm = () => {
    onChange(tempDate.toISOString().split('T')[0])
    setOpen(false)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <Button
        testID={testID}
        icon={Calendar}
        onPress={() => setOpen(true)}
        theme={value ? 'active' : undefined}
        size="$4"
        backgroundColor={value ? '$blue5' : '$gray5'}
        justifyContent="flex-start"
      >
        {value ? formatDate(value) : placeholder || 'Sélectionner une date'}
      </Button>

      <Sheet
        modal
        open={open}
        onOpenChange={handleOpenChange}
        snapPoints={[60]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <Text fontSize="$6" fontWeight="bold">
            Sélectionner une date
          </Text>

          <YStack flex={1} alignItems="center" justifyContent="center">
            <DateTimePicker
              value={tempDate}
              mode="date"
              onChange={handleChange}
              display="inline"
            />
          </YStack>

          <Button
            size="$4"
            theme="active"
            backgroundColor="$blue5"
            onPress={handleConfirm}
            marginTop="$4"
            marginBottom="$4"
          >
            Confirmer
          </Button>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
