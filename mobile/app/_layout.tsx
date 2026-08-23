import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { TravelDataProvider } from '@/src/context/TravelDataContext';
import { TravelTypeProvider, useTravelType } from '@/src/context/TravelTypeContext';
import { resolveAppAccess } from '@/src/travel-type/routing';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <TravelTypeProvider>
          <AppNavigator />
        </TravelTypeProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function AppNavigator() {
  const { user, isAuthReady } = useAuth();
  const { onboardingCompleted, isOnboardingReady } = useTravelType();
  const access = resolveAppAccess(
    isAuthReady,
    Boolean(user),
    isOnboardingReady,
    onboardingCompleted,
  );

  return (
    <TravelDataProvider key={user?.uid ?? 'signed-out'}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={access === 'loading'}>
          <Stack.Screen name="auth-loading" />
        </Stack.Protected>

        <Stack.Protected guard={access === 'auth'}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack.Protected>

        <Stack.Protected guard={access === 'survey' || access === 'app'}>
          <Stack.Screen name="travel-survey" />
          <Stack.Screen name="travel-type-result" />
        </Stack.Protected>

        <Stack.Protected guard={access === 'app'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="travel-recommendations" />
          <Stack.Screen name="mate-recommendations" />
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
