import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import Colors from '@/constants/colors';
import { DiagnosticProvider } from '@/hooks/useDiagnostic';
import { NorthStarProvider } from '@/hooks/useNorthStar';
import { IfThenProvider } from '@/hooks/useIfThen';
import { JournalSessionsProvider } from '@/hooks/useJournalSessions';
import { PlanProvider } from '@/hooks/usePlan';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

/** Waits for auth to resolve, then dismisses the native splash. */
function SplashGate({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  return <>{children}</>;
}

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
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
        <SafeAreaProvider>
          <AuthProvider>
            <SplashGate>
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
            </SplashGate>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
