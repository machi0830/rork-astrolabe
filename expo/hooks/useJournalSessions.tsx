import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import type { GenreId } from '@/constants/genres';

export interface JournalSession {
  id: string;
  genre: GenreId;
  layerAnswers: string[];
  createdAt: string;
}

interface StoredState {
  sessions: JournalSession[];
}

const STORAGE_KEY = 'journal_sessions_v1';
const MAX_KEEP = 50;

const genId = (): string =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const [JournalSessionsProvider, useJournalSessions] = createContextHook(() => {
  const [sessions, setSessions] = useState<JournalSession[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && raw) {
          const parsed = JSON.parse(raw) as StoredState;
          setSessions(parsed.sessions ?? []);
        }
      } catch (e) {
        console.log('[journal_sessions] load failed', e);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const addSession = useCallback(
    async (input: { genre: GenreId; layerAnswers: string[] }) => {
      const session: JournalSession = {
        id: genId(),
        genre: input.genre,
        layerAnswers: input.layerAnswers,
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => {
        const next = [session, ...prev].slice(0, MAX_KEEP);
        AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ sessions: next } satisfies StoredState)
        ).catch((e) => console.log('[journal_sessions] persist failed', e));
        return next;
      });
      return session;
    },
    []
  );

  return { loaded, sessions, addSession };
});
