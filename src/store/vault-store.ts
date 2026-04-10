import { createClient } from '@/lib/supabase/client';
import type { Vault } from '@/lib/supabase/types';
import { create } from 'zustand';

interface VaultState {
  vaults: Vault[];
  currentVault: Vault | null;
  isLoading: boolean;
  isCurrentVaultLoading: boolean;

  fetchVaults: () => Promise<void>;
  fetchVaultById: (id: string) => Promise<Vault>;
  createVault: (name: string, description?: string) => Promise<Vault>;
  setCurrentVault: (vault: Vault | null) => void;
  updateVault: (id: string, data: Partial<Vault>) => Promise<void>;
  deleteVault: (id: string) => Promise<void>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  vaults: [],
  currentVault: null,
  isLoading: false,
  isCurrentVaultLoading: false,

  fetchVaults: async () => {
    console.log('[VaultStore] fetchVaults called');
    set({ isLoading: true });
    const supabase = createClient();

    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .order('updated_at', { ascending: false });

    console.log('[VaultStore] fetchVaults result:', { count: data?.length, error });

    if (!error && data) {
      set({ vaults: data, isLoading: false });
    } else {
      console.error('[VaultStore] Error:', error);
      set({ isLoading: false });
    }
  },

  createVault: async (name, description) => {
    console.log('[VaultStore] createVault called:', name);
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      console.error('[VaultStore] No user found');
      throw new Error('Not authenticated');
    }

    console.log('[VaultStore] Creating vault for user:', user.id);

    const { data, error } = await supabase
      .from('vaults')
      .insert({ name, description, owner_id: user.id })
      .select()
      .single();

    console.log('[VaultStore] createVault result:', { data, error });

    if (error) {
      console.error('[VaultStore] Error creating vault:', error);
      throw error;
    }

    set((state) => ({ vaults: [data, ...state.vaults] }));
    return data;
  },

  setCurrentVault: (vault) => set({ currentVault: vault }),

  updateVault: async (id, data) => {
    const supabase = createClient();

    const { error } = await supabase.from('vaults').update(data).eq('id', id);

    if (error) throw error;

    set((state) => ({
      vaults: state.vaults.map((v) => (v.id === id ? { ...v, ...data } : v)),
      currentVault:
        state.currentVault?.id === id ? { ...state.currentVault, ...data } : state.currentVault,
    }));
  },

  fetchVaultById: async (id) => {
    const supabase = createClient();

    set({ isCurrentVaultLoading: true });

    const { data, error } = await supabase.from('vaults').select('*').eq('id', id).single();

    if (error) {
      console.error('[VaultStore] Error fetching vault by id:', error);
      set({ isCurrentVaultLoading: false });
      throw error;
    }

    set({ currentVault: data, isCurrentVaultLoading: false });
    return data;
  },

  deleteVault: async (id) => {
    const supabase = createClient();

    const { error } = await supabase.from('vaults').delete().eq('id', id);

    if (error) throw error;

    set((state) => ({
      vaults: state.vaults.filter((v) => v.id !== id),
      currentVault: state.currentVault?.id === id ? null : state.currentVault,
    }));
  },
}));
