import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DomainId } from '@/constants/domains';
import { supabase } from '@/lib/supabase';

export const MAX_SLOTS = 5 as const;

export type RuleStatus = 'active' | 'graduate';

export interface IfThenRule {
  id: string;
  ifTrigger: string;
  thenAction: string;
  domain: DomainId;
  color: string;
  streakCount: number;
  lastCheckedAt: string | null;
  status: RuleStatus;
  graduateAt: string | null;
  createdAt: string;
  /** ISO date strings (YYYY-MM-DD) of recent check-in days, newest last */
  checkDates: string[];
}

interface StoredState {
  rules: IfThenRule[];
}

const STORAGE_KEY = 'ifthen_rules_v1';

const todayISO = (): string => new Date().toISOString().split('T')[0];

const dayDiff = (a: string, b: string): number => {
  const da = new Date(a + 'T00:00:00').getTime();
  const db = new Date(b + 'T00:00:00').getTime();
  return Math.round((db - da) / 86400000);
};

const genId = (): string =>
  `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const [IfThenProvider, useIfThen] = createContextHook(() => {
  const [rules, setRules] = useState<IfThenRule[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && raw) {
          const parsed = JSON.parse(raw) as StoredState;
          setRules(parsed.rules ?? []);
        }
      } catch (e) {
        console.log('[ifthen] load failed', e);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: IfThenRule[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ rules: next } satisfies StoredState));
    } catch (e) {
      console.log('[ifthen] persist failed', e);
    }
  }, []);

  const addRule = useCallback(
    async (input: { ifTrigger: string; thenAction: string; domain: DomainId; color: string }) => {
      const active = rules.filter((r) => r.status === 'active');
      if (active.length >= MAX_SLOTS) {
        console.log('[ifthen] slots full');
        return null;
      }
      const rule: IfThenRule = {
        id: genId(),
        ifTrigger: input.ifTrigger,
        thenAction: input.thenAction,
        domain: input.domain,
        color: input.color,
        streakCount: 0,
        lastCheckedAt: null,
        status: 'active',
        graduateAt: null,
        createdAt: new Date().toISOString(),
        checkDates: [],
      };
      const next = [...rules, rule];
      setRules(next);
      await persist(next);
      if (supabase) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          await supabase.from('ifthen_rules').insert({
            user_id: userData?.user?.id ?? null,
            if_trigger: rule.ifTrigger,
            then_action: rule.thenAction,
            domain: rule.domain,
            status: 'active',
            streak_count: 0,
          });
        } catch (e) {
          console.log('[ifthen] supabase insert failed', e);
        }
      }
      return rule;
    },
    [rules, persist]
  );

  const checkToday = useCallback(
    async (ruleId: string) => {
      const today = todayISO();
      let didCheck = false;
      const next = rules.map((r) => {
        if (r.id !== ruleId) return r;
        if (r.lastCheckedAt === today) return r;
        didCheck = true;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yISO = yesterday.toISOString().split('T')[0];
        const continuous = r.lastCheckedAt === yISO;
        const newStreak = continuous ? r.streakCount + 1 : 1;
        const newDates = [...r.checkDates, today].slice(-30);
        return {
          ...r,
          streakCount: newStreak,
          lastCheckedAt: today,
          checkDates: newDates,
        };
      });
      if (!didCheck) return false;
      setRules(next);
      await persist(next);
      if (supabase) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          await supabase.from('ifthen_logs').insert({
            user_id: userData?.user?.id ?? null,
            rule_id: ruleId,
            checked_at: new Date().toISOString(),
          });
          const r = next.find((x) => x.id === ruleId);
          if (r) {
            await supabase
              .from('ifthen_rules')
              .update({
                streak_count: r.streakCount,
                last_checked_at: new Date().toISOString(),
              })
              .eq('id', ruleId);
          }
        } catch (e) {
          console.log('[ifthen] supabase check failed', e);
        }
      }
      return true;
    },
    [rules, persist]
  );

  const graduate = useCallback(
    async (ruleId: string) => {
      const graduateAt = new Date().toISOString();
      const next = rules.map((r) =>
        r.id === ruleId ? { ...r, status: 'graduate' as const, graduateAt } : r
      );
      setRules(next);
      await persist(next);
      if (supabase) {
        try {
          await supabase
            .from('ifthen_rules')
            .update({ status: 'graduate', graduate_at: graduateAt })
            .eq('id', ruleId);
        } catch (e) {
          console.log('[ifthen] supabase graduate failed', e);
        }
      }
    },
    [rules, persist]
  );

  const activeRules = useMemo(() => rules.filter((r) => r.status === 'active'), [rules]);
  const graduatedRules = useMemo(
    () =>
      rules
        .filter((r) => r.status === 'graduate')
        .sort((a, b) => (b.graduateAt ?? '').localeCompare(a.graduateAt ?? '')),
    [rules]
  );

  return {
    loaded,
    rules,
    activeRules,
    graduatedRules,
    addRule,
    checkToday,
    graduate,
  };
});

export const getStreakBadge = (
  streak: number
): { label: string; color: string; bg: string } => {
  if (streak >= 30) return { label: '卒業可能 ✦', color: '#C8A040', bg: '#1A1000' };
  if (streak >= 15) return { label: '習慣化中', color: '#289A78', bg: '#0A2018' };
  return { label: '練習中', color: '#60A5FA', bg: '#0A1428' };
};

/** Build last-N day dot pattern (true = checked, false = missed), oldest first. */
export const buildRecentDots = (checkDates: string[], days: number = 8): boolean[] => {
  const set = new Set(checkDates);
  const out: boolean[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    out.push(set.has(iso));
  }
  return out;
};

export const _dayDiff = dayDiff;
