import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { TravelDataProvider } from '@/src/context/TravelDataContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function AppNavigator() {
  const { user, isAuthReady } = useAuth();

  return (
    <TravelDataProvider key={user?.uid ?? 'signed-out'}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isAuthReady}>
          <Stack.Screen name="auth-loading" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthReady && !user}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthReady && Boolean(user)}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile-edit" />
          <Stack.Screen name="record/create" />
          <Stack.Screen name="record/calendar" />
          <Stack.Screen name="record/[id]" />
          <Stack.Screen name="travel-map" />
          <Stack.Screen name="mascot-book" />
          <Stack.Screen name="place/[id]" />
          <Stack.Screen name="mate/[id]" />
          <Stack.Screen name="mate/chat/[id]" />
          <Stack.Screen name="mate/companion/[id]" />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', headerShown: true, title: 'Modal' }}
          />
        </Stack.Protected>
      </Stack>
    </TravelDataProvider>
  );
}
