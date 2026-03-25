import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean

  initialize: () => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
  setProfile: (profile: Profile | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      set({ user, profile, isLoading: false, isInitialized: true })
    } else {
      set({ user: null, profile: null, isLoading: false, isInitialized: true })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ user: session.user, profile })
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null })
      }
    })
  },

  signInWithOAuth: async (provider) => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  setProfile: (profile) => set({ profile }),
}))
