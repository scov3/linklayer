'use client';

import { Link2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface GraphEditorPanelProps {
  notes: Array<{ id: string; title: string }>;
  links: Array<{
    id: string;
    source_note_id: string;
    target_note_id: string;
    link_type: string;
  }>;
  onCreateLink: (sourceId: string, targetId: string) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
}

export function GraphEditorPanel({
  notes,
  links,
  onCreateLink,
  onDeleteLink,
}: GraphEditorPanelProps) {
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const getNoteTitle = (id: string) => notes.find((n) => n.id === id)?.title ?? 'Без названия';

  const isDuplicate = (src: string, tgt: string) =>
    links.some((l) => l.source_note_id === src && l.target_note_id === tgt);

  const handleCreate = async () => {
    setValidationError(null);

    if (!sourceId || !targetId) {
      setValidationError('Выберите обе заметки.');
      return;
    }
    if (sourceId === targetId) {
      setValidationError('Нельзя создать связь заметки с самой собой.');
      return;
    }
    if (isDuplicate(sourceId, targetId)) {
      setValidationError('Такая связь уже существует.');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateLink(sourceId, targetId);
      setSourceId('');
      setTargetId('');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (linkId: string) => {
    setDeletingId(linkId);
    try {
      await onDeleteLink(linkId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="flex h-full w-72 flex-col gap-5 rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <h2 className="text-sm font-semibold tracking-wide text-stone-800 dark:text-stone-100">
          Связи между заметками
        </h2>
      </div>

      {/* Create form */}
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
        <p className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
          Новая связь
        </p>

        <div className="flex flex-col gap-2">
          <label htmlFor="source-select" className="text-xs text-stone-500 dark:text-stone-400">
            Заметка A (источник)
          </label>
          <select
            id="source-select"
            value={sourceId}
            onChange={(e) => {
              setSourceId(e.target.value);
              setValidationError(null);
            }}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 dark:focus:border-amber-500 dark:focus:ring-amber-900"
          >
            <option value="">— выберите заметку —</option>
            {notes.map((note) => (
              <option key={note.id} value={note.id}>
                {note.title || 'Без названия'}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="target-select" className="text-xs text-stone-500 dark:text-stone-400">
            Заметка B (цель)
          </label>
          <select
            id="target-select"
            value={targetId}
            onChange={(e) => {
              setTargetId(e.target.value);
              setValidationError(null);
            }}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 dark:focus:border-amber-500 dark:focus:ring-amber-900"
          >
            <option value="">— выберите заметку —</option>
            {notes.map((note) => (
              <option key={note.id} value={note.id}>
                {note.title || 'Без названия'}
              </option>
            ))}
          </select>
        </div>

        {validationError && (
          <p className="text-xs text-red-500 dark:text-red-400">{validationError}</p>
        )}

        <button
          type="button"
          onClick={handleCreate}
          disabled={isCreating}
          className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          {isCreating ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isCreating ? 'Создание…' : 'Создать связь'}
        </button>
      </div>

      {/* Links list */}
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        <p className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
          Существующие связи ({links.length})
        </p>

        {links.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-200 py-8 dark:border-stone-700">
            <Link2 className="h-6 w-6 text-stone-300 dark:text-stone-600" />
            <p className="text-center text-xs text-stone-400 dark:text-stone-500">
              Связей пока нет.
              <br />
              Создайте первую выше.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5 overflow-y-auto pr-0.5">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex items-center gap-2 rounded-lg border border-stone-100 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-stone-700 dark:bg-stone-800"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-stone-700 dark:text-stone-200">
                    {getNoteTitle(link.source_note_id)}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-stone-400 dark:text-stone-500">
                    → {getNoteTitle(link.target_note_id)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  disabled={deletingId === link.id}
                  aria-label="Удалить связь"
                  className="shrink-0 rounded-md p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                >
                  {deletingId === link.id ? (
                    <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
