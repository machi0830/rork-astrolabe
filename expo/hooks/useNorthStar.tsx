import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type Situation =
  | 'in_relationship'
  | 'one_sided'
  | 'breakup'
  | 'single';

export const SITUATIONS: { id: Situation; label: string }[] = [
  { id: 'in_relationship', label: '交際中' },
  { id: 'one_sided', label: '片思い中' },
  { id: 'breakup', label: '別れを経験した' },
  { id: 'single', label: '今は恋愛していない' },
];

export interface NorthStarData {
  statement: string;
  name: string | null;
  situation: Situation | null;
  updatedAt: string;
}

const STORAGE_KEY = 'north_star_v1';

export const [NorthStarProvider, useNorthStar] = createContextHook(() => {
  const [data, setData] = useState<NorthStarData | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && raw) {
          setData(JSON.parse(raw) as NorthStarData);
        }
      } catch (e) {
        console.log('[northstar] load failed', e);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const saveNorthStar = useCallback(
    async (input: { statement: string; name: string | null; situation: Situation | null }) => {
      const updatedAt = new Date().toISOString();
      const next: NorthStarData = { ...input, updatedAt };
      setData(next);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.log('[northstar] persist failed', e);
      }
      if (supabase) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData?.user?.id ?? null;
          await supabase.from('north_stars').upsert({
            user_id: userId,
            statement: next.statement,
            name: next.name,
            situation: next.situation,
            updated_at: updatedAt,
          });
          console.log('[northstar] supabase upsert ok');
        } catch (e) {
          console.log('[northstar] supabase upsert failed', e);
        }
      } else {
        console.log('[northstar] supabase not configured – local save only');
      }
      return next;
    },
    []
  );

  return { loaded, data, saveNorthStar };
});
