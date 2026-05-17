import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/colors';

const ONBOARDING_KEY = 'onboarding_completed';

export default function Gate() {
  const { user, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((v) => {
        if (mounted) setOnboardingDone(!!v);
      })
      .catch(() => {
        if (mounted) setOnboardingDone(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || onboardingDone === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.starlight} />
      </View>
    );
  }

  if (!onboardingDone) {
    return <Redirect href="/onboarding/ob1" />;
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/(tabs)/observation" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
// expo/app/index.tsx
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function RootIndex() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C8A040" />
      </View>
    );
  }

  // ログインしていればアストロラーベのある (tabs) へリダイレクト
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#050A18',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
