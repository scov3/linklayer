import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/types';
import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;

  initialize: () => void;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  initialize: () => {
    const supabase = createClient();

    console.log('[Auth] Initializing...');

    // Check current session
    supabase.auth
      .getSession()
      .then(async ({ data: { session }, error }) => {
        console.log('[Auth] getSession result:', { session: !!session, error });

        if (session?.user) {
          console.log('[Auth] User found:', session.user.email);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('[Auth] Profile:', { profile: !!profile, error: profileError });
          set({ user: session.user, profile, isLoading: false });
        } else {
          console.log('[Auth] No session');
          set({ user: null, profile: null, isLoading: false });
        }
      })
      .catch((err) => {
        console.error('[Auth] getSession error:', err);
        set({ user: null, profile: null, isLoading: false });
      });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] State change:', event, !!session);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[Auth] SIGNED_IN:', session.user.email);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ user: session.user, profile, isLoading: false });
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] SIGNED_OUT');
        set({ user: null, profile: null, isLoading: false });
      }
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
    set({ user: null, profile: null });
  },
}));
