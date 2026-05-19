import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';
import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  initialized: boolean;

  initialize: () => void;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  initialized: false,

  initialize: () => {
    const supabase = createClient();
    const state = useAuthStore.getState();

    if (state.initialized) return;

    const loadProfile = async (user: User | null) => {
      if (!user) {
        set({ user: null, profile: null, isLoading: false });
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[Auth] Profile error:', error);
      }

      set({ user, profile: profile ?? null, isLoading: false });
    };

    set({ initialized: true, isLoading: true });

    console.log('[Auth] Initializing...');

    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        console.log('[Auth] getSession result:', { session: !!session, error });
        void loadProfile(session?.user ?? null);
      })
      .catch((err) => {
        console.error('[Auth] getSession error:', err);
        set({ user: null, profile: null, isLoading: false });
      });

    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] State change:', event, !!session);
      if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null, isLoading: false });
        return;
      }

      void loadProfile(session?.user ?? null);
    });
  },

  signInWithOAuth: async (provider) => {
    const supabase = createClient();
    console.log('[Auth] Starting OAuth with:', provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('[Auth] OAuth error:', error);
      throw error;
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null, isLoading: false });
  },
}));
