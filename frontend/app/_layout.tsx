import React from 'react';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Book Selection' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile Selection' }} />
      <Stack.Screen name="roleplay" options={{ title: 'Role Play' }} />
      <Stack.Screen name="feedback" options={{ title: 'Feedback' }} />
    </Stack>
  );
}