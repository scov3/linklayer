import { createClient } from '@/lib/supabase/client';
import type { Note, Tag } from '@/lib/supabase/types';
import { create } from 'zustand';

// Тип для заметки с тегами
type NoteWithTags = Note & {
  tags?: Tag[];
};

interface NotesState {
  notes: NoteWithTags[];
  currentNote: NoteWithTags | null;
  isLoading: boolean;
  error: string | null;

  fetchNotes: (vaultId: string) => Promise<void>;
  createNote: (
    vaultId: string,
    title: string,
    content: string,
    tagNames?: string[]
  ) => Promise<NoteWithTags>;
  updateNote: (id: string, data: Partial<Note>, tagNames?: string[]) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: NoteWithTags | null) => void;
  clearNotes: () => void;
}

// Вспомогательная функция для добавления тегов к заметке
async function addTagsToNote(supabase: any, note: Note, tagNames: string[]): Promise<NoteWithTags> {
  if (!tagNames || tagNames.length === 0) {
    return { ...note, tags: [] };
  }

  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('Not authenticated');

  // Получаем или создаем теги
  const tagsWithIds = [];
  for (const tagName of tagNames) {
    // Проверяем, существует ли тег
    const { data: existingTag, error: tagError } = await supabase
      .from('tags')
      .select('*')
      .eq('name', tagName)
      .eq('vault_id', note.vault_id)
      .single();

    let tagId: string;

    if (tagError || !existingTag) {
      // Создаем новый тег
      const { data: newTag, error: createTagError } = await supabase
        .from('tags')
        .insert({
          name: tagName,
          vault_id: note.vault_id,
          color: getRandomColor(), // функция для получения случайного цвета для тега
        })
        .select()
        .single();

      if (createTagError) throw createTagError;
      tagId = newTag.id;
    } else {
      tagId = existingTag.id;
    }

    tagsWithIds.push({ id: tagId, name: tagName, vault_id: note.vault_id, color: '' });
  }

  // Создаем связи между заметкой и тегами
  const tagConnections = tagNames.map((tagName) => {
    const tag = tagsWithIds.find((t) => t.name === tagName);
    return { note_id: note.id, tag_id: tag!.id };
  });

  const { error: connectionError } = await supabase
    .from('note_tags')
    .insert(tagConnections)
    .select();

  if (connectionError && connectionError.code !== '23505') {
    // игнорируем ошибку дубликата
    console.error('Error connecting tags to note:', connectionError);
  }

  return { ...note, tags: tagsWithIds };
}

// Вспомогательная функция для обновления тегов у заметки
async function updateNoteTags(
  supabase: any,
  noteId: string,
  tagNames: string[]
): Promise<NoteWithTags> {
  // Сначала получаем текущую заметку
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (noteError) throw noteError;

  // Удаляем старые теги заметки
  const { error: deleteError } = await supabase.from('note_tags').delete().eq('note_id', noteId);

  if (deleteError) {
    console.error('Error deleting old tags:', deleteError);
  }

  if (!tagNames || tagNames.length === 0) {
    return { ...note, tags: [] };
  }

  // Добавляем новые теги
  const tagsWithIds = [];
  for (const tagName of tagNames) {
    // Проверяем, существует ли тег
    const { data: existingTag, error: tagError } = await supabase
      .from('tags')
      .select('*')
      .eq('name', tagName)
      .eq('vault_id', note.vault_id)
      .single();

    let tagId: string;

    if (tagError || !existingTag) {
      // Создаем новый тег
      const { data: newTag, error: createTagError } = await supabase
        .from('tags')
        .insert({
          name: tagName,
          vault_id: note.vault_id,
          color: getRandomColor(),
        })
        .select()
        .single();

      if (createTagError) throw createTagError;
      tagId = newTag.id;
    } else {
      tagId = existingTag.id;
    }

    tagsWithIds.push({ id: tagId, name: tagName, vault_id: note.vault_id, color: '' });
  }

  // Создаем связи между заметкой и тегами
  const tagConnections = tagNames.map((tagName) => {
    const tag = tagsWithIds.find((t) => t.name === tagName);
    return { note_id: noteId, tag_id: tag!.id };
  });

  const { error: connectionError } = await supabase
    .from('note_tags')
    .insert(tagConnections)
    .select();

  if (connectionError && connectionError.code !== '23505') {
    // игнорируем ошибку дубликата
    console.error('Error connecting tags to note:', connectionError);
  }

  return { ...note, tags: tagsWithIds };
}

// Вспомогательная функция для получения случайного цвета
function getRandomColor(): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f43f5e', // rose
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,

  fetchNotes: async (vaultId) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    try {
      // Получаем заметки
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('vault_id', vaultId)
        .order('updated_at', { ascending: false });

      if (notesError) {
        set({ error: notesError.message, isLoading: false });
        return;
      }

      // Для каждой заметки получаем теги
      const notesWithTags = await Promise.all(
        notesData.map(async (note) => {
          const { data: tagsData, error: tagsError } = await supabase
            .from('tags')
            .select(`
              *
            `)
            .eq('note_tags.note_id', note.id)
            .eq('note_tags.vault_id', vaultId);

          if (tagsError) {
            console.error(`Error fetching tags for note ${note.id}:`, tagsError);
            return { ...note, tags: [] };
          }

          return { ...note, tags: tagsData || [] };
        })
      );

      set({ notes: notesWithTags, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Unknown error', isLoading: false });
    }
  },

  createNote: async (vaultId, title, content, tagNames = []) => {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Создаем заметку
    const { data: noteData, error: noteError } = await supabase
      .from('notes')
      .insert({
        vault_id: vaultId,
        title,
        content,
        created_by: user.user.id,
      })
      .select()
      .single();

    if (noteError) throw noteError;

    // Обрабатываем теги
    const noteWithTags = await addTagsToNote(supabase, noteData, tagNames);

    set((state) => ({ notes: [noteWithTags, ...state.notes] }));
    return noteWithTags;
  },

  updateNote: async (id, data, tagNames = []) => {
    const supabase = createClient();

    // Обновляем заметку
    const { error: noteError } = await supabase
      .from('notes')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (noteError) throw noteError;

    // Обновляем теги
    const updatedNote = await updateNoteTags(supabase, id, tagNames);

    set((state) => ({
      notes: state.notes.map((note) => (note.id === id ? updatedNote : note)),
      currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
    }));
  },

  deleteNote: async (id) => {
    const supabase = createClient();

    // Удаляем связи с тегами
    await supabase.from('note_tags').delete().eq('note_id', id);

    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) throw error;

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      currentNote: state.currentNote?.id === id ? null : state.currentNote,
    }));
  },

  setCurrentNote: (note) => set({ currentNote: note }),

  clearNotes: () => set({ notes: [] }),
}));
