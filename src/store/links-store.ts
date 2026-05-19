import { createClient } from '@/lib/supabase/client';
import type { Link } from '@/lib/supabase/types';
import { create } from 'zustand';

interface LinksState {
  links: Link[];
  isLoading: boolean;
  error: string | null;

  fetchLinks: (vaultId: string) => Promise<void>;
  createLink: (sourceNoteId: string, targetNoteId: string) => Promise<Link>;
  deleteLink: (id: string) => Promise<void>;
  clearLinks: () => void;
}

export const useLinksStore = create<LinksState>((set) => ({
  links: [],
  isLoading: false,
  error: null,

  fetchLinks: async (vaultId) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    try {
      // Шаг 1: получаем все note IDs, принадлежащие vault
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('id')
        .eq('vault_id', vaultId);

      if (notesError) {
        set({ error: notesError.message, isLoading: false });
        return;
      }

      const noteIds = (notesData ?? []).map((n) => n.id);

      if (noteIds.length === 0) {
        set({ links: [], isLoading: false });
        return;
      }

      // Шаг 2: получаем все links, где source_note_id входит в noteIds
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .in('source_note_id', noteIds);

      if (linksError) {
        set({ error: linksError.message, isLoading: false });
        return;
      }

      set({ links: linksData ?? [], isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  createLink: async (sourceNoteId, targetNoteId) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('links')
      .insert({ source_note_id: sourceNoteId, target_note_id: targetNoteId })
      .select()
      .single();

    if (error) throw error;

    set((state) => ({ links: [...state.links, data] }));
    return data;
  },

  deleteLink: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ links: state.links.filter((l) => l.id !== id) }));
  },

  clearLinks: () => set({ links: [] }),
}));
