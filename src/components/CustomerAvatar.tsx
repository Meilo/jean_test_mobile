import React from 'react'
import { Circle } from 'tamagui'
import { User } from '@tamagui/lucide-icons'

interface CustomerAvatarProps {
  size?: number
  iconSize?: number
}

export const CustomerAvatar = ({
  size = 40,
  iconSize = 24,
}: CustomerAvatarProps) => (
  <Circle size={size} backgroundColor="$blue4">
    <User size={iconSize} color="$blue10" />
  </Circle>
)
