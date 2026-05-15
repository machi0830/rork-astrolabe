import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type PlanId = 'trial' | 'standard' | 'longGame';

const STORAGE_KEY = 'user_plan';

export const [PlanProvider, usePlan] = createContextHook(() => {
  const [plan, setPlanState] = useState<PlanId>('trial');
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && (raw === 'standard' || raw === 'longGame' || raw === 'trial')) {
          setPlanState(raw);
        }
      } catch (e) {
        console.log('[plan] load failed', e);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setPlan = useCallback(async (next: PlanId) => {
    setPlanState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      console.log('[plan] persist failed', e);
    }
  }, []);

  const isPro = plan === 'standard' || plan === 'longGame';

  return { plan, isPro, loaded, setPlan };
});
