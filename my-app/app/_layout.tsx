import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from '../store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ElevenLabsProvider } from "@elevenlabs/react-native";


import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
        <ElevenLabsProvider key="sk_b4387de9c69ffa9762d60ee07820b18a71c63e3d96c8a254">
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ title: 'Select Book & Lesson', headerShown: false }} />
              <Stack.Screen name="profile-selection" options={{ title: 'Select Profile', headerShown: false }} />
              <Stack.Screen name="profile" options={{ title: 'Select Role' }} />
              <Stack.Screen name="roleplay" options={{ title: 'Role Play', headerShown: false }} />
              <Stack.Screen name="roleplay-test" options={{ title: 'AI Role Play', headerShown: false }} />
              <Stack.Screen name="feedback" options={{ title: 'Feedback', headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
          </ThemeProvider>
          </ElevenLabsProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}