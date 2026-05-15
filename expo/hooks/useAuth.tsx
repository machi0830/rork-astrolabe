import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const MOCK_AUTH_KEY = 'mock_auth_user_v1';

export type AuthUser = {
  id: string;
  email: string;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

function toAuthUser(u: User | null | undefined): AuthUser | null {
  if (!u) return null;
  return { id: u.id, email: u.email ?? '' };
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (!mounted) return;
          setState({ user: toAuthUser(data.session?.user), loading: false });
        } catch (e) {
          console.log('[auth] getSession failed', e);
          if (mounted) setState({ user: null, loading: false });
        }
      } else {
        try {
          const raw = await AsyncStorage.getItem(MOCK_AUTH_KEY);
          if (!mounted) return;
          setState({
            user: raw ? (JSON.parse(raw) as AuthUser) : null,
            loading: false,
          });
        } catch {
          if (mounted) setState({ user: null, loading: false });
        }
      }
    })();

    let unsub: (() => void) | null = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_e, session: Session | null) => {
        setState({ user: toAuthUser(session?.user), loading: false });
      });
      unsub = () => data.subscription.unsubscribe();
    }

    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      setState({ user: toAuthUser(data.user), loading: false });
      return { error: null };
    }
    // Mock fallback
    const mockUser: AuthUser = { id: 'mock-' + email, email };
    await AsyncStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(mockUser));
    setState({ user: mockUser, loading: false });
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      const u = data.user;
      if (u) {
        try {
          await supabase.from('user_profiles').insert({
            id: u.id,
            plan: 'trial',
            trial_started_at: new Date().toISOString(),
          });
        } catch (e) {
          console.log('[auth] user_profiles insert failed', e);
        }
      }
      setState({ user: toAuthUser(data.user), loading: false });
      return { error: null };
    }
    const mockUser: AuthUser = { id: 'mock-' + email, email };
    await AsyncStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(mockUser));
    setState({ user: mockUser, loading: false });
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.log('[auth] signOut failed', e);
      }
    }
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.log('[auth] AsyncStorage.clear failed', e);
    }
    setState({ user: null, loading: false });
  }, []);

  return { ...state, signIn, signUp, signOut };
});
