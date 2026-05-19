'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hash, Loader2, Save, Tag, Trash2, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type EditorTag = string | { name: string };

interface NoteEditorProps {
  note?: {
    id?: string;
    title: string;
    content: string;
    tags?: EditorTag[];
  } | null;
  onSave: (title: string, content: string, tags: string[]) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  onRequestDelete?: () => void;
}

function normalizeTag(tag: EditorTag) {
  return typeof tag === 'string' ? tag : tag.name;
}

export default function NoteEditor({
  note,
  onSave,
  onCancel,
  onDelete,
  onRequestDelete,
}: NoteEditorProps) {
  const initialTags = useMemo(() => note?.tags?.map(normalizeTag) || [], [note?.tags]);
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setTags(initialTags);
    setNewTag('');
  }, [initialTags, note?.content, note?.title]);

  const hasChanges =
    title !== (note?.title || '') ||
    content !== (note?.content || '') ||
    tags.join('|') !== initialTags.join('|');

  const handleAddTag = () => {
    const tag = newTag.trim().replace(/^#/, '');
    if (!tag || tags.includes(tag)) return;

    setTags([...tags, tag]);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newTag.trim()) {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    const safeTitle = title.trim();
    if (!safeTitle) return;

    setIsSaving(true);
    try {
      await onSave(safeTitle, content, tags);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note?.id || !onDelete) return;

    if (onRequestDelete) {
      onRequestDelete();
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full border-primary/30 bg-card/95 shadow-md">
      <CardHeader className="space-y-4 rounded-t-xl border-b border-primary/20 bg-primary/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-foreground">
              {note?.id ? 'Редактирование заметки' : 'Новая заметка'}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Markdown, теги и быстрое сохранение в одном месте.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {note?.id && onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isSaving || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Удалить
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving || isDeleting}
            >
              <X className="mr-2 h-4 w-4" />
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isDeleting || !title.trim()}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {hasChanges ? 'Сохранить' : 'Сохранено'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="note-title" className="text-sm font-medium">
              Заголовок
            </Label>
            <Input
              id="note-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Введите заголовок заметки..."
              className="mt-1 text-lg font-semibold"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="note-content" className="text-sm font-medium">
              Содержимое
            </Label>
            <div
              className="mt-2 overflow-hidden rounded-xl border border-primary/30 bg-background"
              data-color-mode="light"
            >
              <MDEditor
                value={content}
                onChange={(value = '') => setContent(value)}
                height={460}
                preview="edit"
                textareaProps={{
                  id: 'note-content',
                  placeholder: 'Пишите заметку в Markdown...',
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Label className="flex items-center text-sm font-medium">
                <Hash className="mr-1 h-4 w-4" />
                Теги
              </Label>
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(event) => setNewTag(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Добавить тег..."
                  className="pl-9"
                />
                <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Добавить
              </Button>
            </div>

            <div className="flex min-h-11 flex-wrap gap-2 rounded-lg border border-primary/30 bg-primary/10 p-2">
              {tags.length === 0 ? (
                <span className="text-sm text-muted-foreground">Нет тегов</span>
              ) : (
                tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full px-1 hover:bg-secondary-foreground/20"
                      aria-label={`Удалить тег ${tag}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
