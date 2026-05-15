import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './loading';
import { useAuth } from '@/hooks/useAuth';

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
    return <LoadingScreen />;
  }

  if (!onboardingDone) {
    return <Redirect href="/onboarding/ob1" />;
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/(tabs)/observation" />;
}
