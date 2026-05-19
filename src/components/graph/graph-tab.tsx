'use client';

import type { Link, Note, Tag } from '@/lib/supabase/types';
import { Network, PencilLine, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import GraphEditorPanel from './graph-editor-panel';

// Динамический импорт чтобы избежать SSR ошибок с canvas/cytoscape
const ClassicGraph = dynamic(() => import('./classic-graph'), {
  ssr: false,
  loading: () => <GraphSkeleton />,
});

const PhysicsGraph = dynamic(() => import('./physics-graph'), {
  ssr: false,
  loading: () => <GraphSkeleton />,
});

type GraphMode = 'classic' | 'physics';
type NoteWithTags = Note & { tags?: Tag[] };

interface GraphTabProps {
  notes: NoteWithTags[];
  links: Link[];
  onNoteClick?: (noteId: string) => void;
  onCreateLink: (sourceId: string, targetId: string) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
}

function GraphSkeleton() {
  return (
    <div className="flex h-[560px] w-full animate-pulse items-center justify-center rounded-lg border bg-muted">
      <div className="text-center text-muted-foreground">
        <Network className="mx-auto h-10 w-10 opacity-30" />
        <p className="mt-3 text-sm">Загрузка графа…</p>
      </div>
    </div>
  );
}

export default function GraphTab({
  notes,
  links,
  onNoteClick,
  onCreateLink,
  onDeleteLink,
}: GraphTabProps) {
  const [mode, setMode] = useState<GraphMode>('classic');
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Mode switch */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode('classic')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'classic'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Network className="h-4 w-4" />
            Классический
          </button>
          <button
            type="button"
            onClick={() => setMode('physics')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'physics'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="h-4 w-4" />
            Физический
          </button>
        </div>

        {/* Editor toggle */}
        <button
          type="button"
          onClick={() => setShowEditor((v) => !v)}
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
            showEditor
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-background text-muted-foreground hover:text-foreground'
          }`}
        >
          <PencilLine className="h-4 w-4" />
          {showEditor ? 'Скрыть редактор' : 'Редактор связей'}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
          Заметка
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-indigo-500" />
          Тег
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-0.5 bg-blue-500" />
          <span className="inline-block h-0.5 w-5 bg-blue-500" />
          Связь (note → note)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-muted-foreground" />
          Тег-связь
        </span>
      </div>

      {/* Graph + optional editor panel */}
      <div className={`flex gap-4 ${showEditor ? 'items-start' : ''}`}>
        <div className={showEditor ? 'min-w-0 flex-1' : 'w-full'}>
          {mode === 'classic' ? (
            <ClassicGraph notes={notes} links={links} onNoteClick={onNoteClick} />
          ) : (
            <PhysicsGraph notes={notes} links={links} onNoteClick={onNoteClick} />
          )}
        </div>

        {showEditor && (
          <div className="w-80 shrink-0">
            <GraphEditorPanel
              notes={notes}
              links={links}
              onCreateLink={onCreateLink}
              onDeleteLink={onDeleteLink}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <p className="text-right text-xs text-muted-foreground">
        {notes.length} заметок · {links.length} связей
      </p>
    </div>
  );
}
