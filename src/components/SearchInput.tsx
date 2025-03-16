import React, { memo, useCallback, useState, useEffect } from 'react'
import { Input, XStack } from 'tamagui'
import { Search } from '@tamagui/lucide-icons'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceDelay?: number
}

export const SearchInput = memo(
  ({
    value,
    onChange,
    placeholder = 'Rechercher...',
    debounceDelay = 600,
  }: SearchInputProps) => {
    const [localValue, setLocalValue] = useState(value)

    useEffect(() => {
      setLocalValue(value)
    }, [value])

    useEffect(() => {
      const timer = setTimeout(() => {
        if (localValue !== value) onChange(localValue)
      }, debounceDelay)

      return () => clearTimeout(timer)
    }, [localValue, value, onChange, debounceDelay])

    const handleChange = useCallback((text: string) => {
      setLocalValue(text)
    }, [])

    return (
      <XStack
        alignItems="center"
        backgroundColor="$gray3"
        borderRadius="$4"
        padding="$2"
      >
        <Search size={20} color="$gray10" />
        <Input
          flex={1}
          placeholder={placeholder}
          value={localValue}
          onChangeText={handleChange}
          backgroundColor="transparent"
          borderWidth={0}
        />
      </XStack>
    )
  },
)

SearchInput.displayName = 'SearchInput'
