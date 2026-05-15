import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { DOMAINS, type DomainId } from '@/constants/domains';
import { QUESTIONS_20 } from '@/constants/questions20';
import { supabase } from '@/lib/supabase';
import type { Scores50 } from '@/lib/scoring50';

export type DomainScores = Record<DomainId, number>;

interface StoredResult {
  scores: DomainScores;
  createdAt: string;
}

const STORAGE_KEY = 'diagnostic_result_v1';
const HISTORY_KEY = 'diagnostic_history_v1';
const REOBSERVE_DAYS = 90;

export interface DiagnosticHistoryEntry {
  scores: DomainScores;
  createdAt: string;
}

export const calcScores = (answers: number[]): DomainScores => {
  const out = {} as DomainScores;
  DOMAINS.forEach((d) => {
    const [start, end] = d.qRange;
    let sum = 0;
    for (let i = start; i <= end; i++) sum += answers[i] ?? 0;
    out[d.id] = Math.round((sum / 16) * 100);
  });
  return out;
};

export const [DiagnosticProvider, useDiagnostic] = createContextHook(() => {
  const [result, setResult] = useState<StoredResult | null>(null);
  const [history, setHistory] = useState<DiagnosticHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [raw, rawHist] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ]);
        if (mounted && raw) {
          const parsed = JSON.parse(raw) as StoredResult;
          setResult(parsed);
        }
        if (mounted && rawHist) {
          const parsedHist = JSON.parse(rawHist) as DiagnosticHistoryEntry[];
          setHistory(parsedHist);
        }
      } catch (e) {
        console.log('[diagnostic] load failed', e);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const saveResult = useCallback(async (answers: number[]) => {
    const scores = calcScores(answers);
    const createdAt = new Date().toISOString();
    const next: StoredResult = { scores, createdAt };
    setResult(next);
    const entry: DiagnosticHistoryEntry = { scores, createdAt };
    setHistory((prev) => {
      const merged = [...prev, entry].slice(-30);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(merged)).catch((e) =>
        console.log('[diagnostic] history persist failed', e)
      );
      return merged;
    });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.log('[diagnostic] persist failed', e);
    }
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id ?? null;
        await supabase.from('diagnostic_results').insert({
          user_id: userId,
          attachment: scores.attachment,
          bigfive: scores.bigfive,
          assertion: scores.assertion,
          eq: scores.eq,
          relation: scores.relation,
          version: '20q',
          created_at: createdAt,
        });
        console.log('[diagnostic] supabase insert ok');
      } catch (e) {
        console.log('[diagnostic] supabase insert failed', e);
      }
    } else {
      console.log('[diagnostic] supabase not configured – local save only', scores);
    }
    return scores;
  }, []);

  const reobserveAvailableAt = useMemo<Date | null>(() => {
    if (!result) return null;
    const dt = new Date(result.createdAt);
    dt.setDate(dt.getDate() + REOBSERVE_DAYS);
    return dt;
  }, [result]);

  const canReobserve = useMemo<boolean>(() => {
    if (!result || !reobserveAvailableAt) return true;
    return Date.now() >= reobserveAvailableAt.getTime();
  }, [result, reobserveAvailableAt]);

  const totalQuestions = QUESTIONS_20.length;

  const saveResult50 = useCallback(async (scores50: Scores50) => {
    const createdAt = new Date().toISOString();
    const scores: DomainScores = {
      attachment: 100 - scores50.attachment.anxietyScore,
      bigfive: 100 - scores50.bigfive.N,
      assertion: scores50.assertion.total,
      eq: scores50.eq.total,
      relation: scores50.relation.total,
    };
    const next: StoredResult = { scores, createdAt };
    setResult(next);
    const entry: DiagnosticHistoryEntry = { scores, createdAt };
    setHistory((prev) => {
      const merged = [...prev, entry].slice(-30);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(merged)).catch((e) =>
        console.log('[diagnostic] history persist failed', e)
      );
      return merged;
    });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      await AsyncStorage.setItem('diagnostic_result_50_v1', JSON.stringify({ scores50, createdAt }));
    } catch (e) {
      console.log('[diagnostic] persist50 failed', e);
    }
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id ?? null;
        await supabase.from('diagnostic_results').insert({
          user_id: userId,
          attachment: scores.attachment,
          bigfive: scores.bigfive,
          assertion: scores.assertion,
          eq: scores.eq,
          relation: scores.relation,
          attachment_type: scores50.attachment.attachmentType,
          eq_lowest: scores50.eq.lowest,
          dominant_horseman: scores50.relation.dominantHorseman,
          version: '50q',
          created_at: createdAt,
        });
        console.log('[diagnostic] supabase insert 50q ok');
      } catch (e) {
        console.log('[diagnostic] supabase insert 50q failed', e);
      }
    } else {
      console.log('[diagnostic] supabase not configured – local 50q save only');
    }
  }, []);

  return {
    loaded,
    result,
    history,
    saveResult,
    saveResult50,
    canReobserve,
    reobserveAvailableAt,
    totalQuestions,
  };
});
