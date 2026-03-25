import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Vault } from '@/lib/supabase/types'

interface VaultState {
  vaults: Vault[]
  currentVault: Vault | null
  isLoading: boolean

  fetchVaults: () => Promise<void>
  createVault: (name: string, description?: string) => Promise<Vault>
  setCurrentVault: (vault: Vault | null) => void
  updateVault: (id: string, data: Partial<Vault>) => Promise<void>
  deleteVault: (id: string) => Promise<void>
}

export const useVaultStore = create<VaultState>((set, get) => ({
  vaults: [],
  currentVault: null,
  isLoading: false,

  fetchVaults: async () => {
    set({ isLoading: true })
    const supabase = createClient()

    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!error && data) {
      set({ vaults: data, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  createVault: async (name, description) => {
    const supabase = createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('vaults')
      .insert({ name, description, owner_id: user.user.id })
      .select()
      .single()

    if (error) throw error

    set((state) => ({ vaults: [data, ...state.vaults] }))
    return data
  },

  setCurrentVault: (vault) => set({ currentVault: vault }),

  updateVault: async (id, data) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('vaults')
      .update(data)
      .eq('id', id)

    if (error) throw error

    set((state) => ({
      vaults: state.vaults.map((v) => (v.id === id ? { ...v, ...data } : v)),
      currentVault:
        state.currentVault?.id === id
          ? { ...state.currentVault, ...data }
          : state.currentVault,
    }))
  },

  deleteVault: async (id) => {
    const supabase = createClient()

    const { error } = await supabase.from('vaults').delete().eq('id', id)

    if (error) throw error

    set((state) => ({
      vaults: state.vaults.filter((v) => v.id !== id),
      currentVault: state.currentVault?.id === id ? null : state.currentVault,
    }))
  },
}))
