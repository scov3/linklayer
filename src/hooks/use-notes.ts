import { useNotesStore } from '@/store/notes-store';
import { useEffect } from 'react';

export function useNotes(vaultId: string) {
  const { notes, fetchNotes, isLoading, error, clearNotes } = useNotesStore();

  useEffect(() => {
    if (vaultId) {
      fetchNotes(vaultId);

      // Очищаем заметки при размонтировании
      return () => {
        clearNotes();
      };
    }
  }, [vaultId, fetchNotes, clearNotes]);

  return {
    notes,
    isLoading,
    error,
    refetch: () => fetchNotes(vaultId),
  };
}
