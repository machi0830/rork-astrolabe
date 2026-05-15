import React from 'react';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function NorthStarLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
