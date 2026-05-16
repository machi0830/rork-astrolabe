import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import Colors from '@/constants/colors';
import { DiagnosticProvider } from '@/hooks/useDiagnostic';
import { NorthStarProvider } from '@/hooks/useNorthStar';
import { IfThenProvider } from '@/hooks/useIfThen';
import { JournalSessionsProvider } from '@/hooks/useJournalSessions';
import { PlanProvider } from '@/hooks/usePlan';
import { AuthProvider } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
        <SafeAreaProvider>
          <AuthProvider>
          <PlanProvider>
            <DiagnosticProvider>
              <NorthStarProvider>
                <IfThenProvider>
                  <JournalSessionsProvider>
                    <View style={{ flex: 1, backgroundColor: Colors.background }}>
                      <RootLayoutNav />
                    </View>
                  </JournalSessionsProvider>
                </IfThenProvider>
              </NorthStarProvider>
            </DiagnosticProvider>
          </PlanProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
