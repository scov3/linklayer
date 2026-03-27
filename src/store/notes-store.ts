import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Note } from '@/lib/supabase/types'

interface NotesState {
  notes: Note[]
  currentNote: Note | null
  isLoading: boolean
  error: string | null

  fetchNotes: (vaultId: string) => Promise<void>
  createNote: (vaultId: string, title: string, content: string) => Promise<Note>
  updateNote: (id: string, data: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  setCurrentNote: (note: Note | null) => void
  clearNotes: () => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,

  fetchNotes: async (vaultId) => {
    set({ isLoading: true, error: null })
    const supabase = createClient()

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('vault_id', vaultId)
      .order('updated_at', { ascending: false })

    if (error) {
      set({ error: error.message, isLoading: false })
    } else {
      set({ notes: data || [], isLoading: false })
    }
  },

  createNote: async (vaultId, title, content) => {
    const supabase = createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .insert({ 
        vault_id: vaultId, 
        title, 
        content,
        created_by: user.user.id 
      })
      .select()
      .single()

    if (error) throw error

    set((state) => ({ notes: [data, ...state.notes] }))
    return data
  },

  updateNote: async (id, data) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('notes')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    set((state) => ({
      notes: state.notes.map((note) => (note.id === id ? { ...note, ...data } : note)),
      currentNote:
        state.currentNote?.id === id
          ? { ...state.currentNote, ...data }
          : state.currentNote,
    }))
  },

  deleteNote: async (id) => {
    const supabase = createClient()

    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (error) throw error

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      currentNote: state.currentNote?.id === id ? null : state.currentNote,
    }))
  },

  setCurrentNote: (note) => set({ currentNote: note }),

  clearNotes: () => set({ notes: [] })
}))