import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Hash, Save, Tag, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Динамический импорт markdown редактора
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface NoteEditorProps {
  note?: {
    id?: string;
    title: string;
    content: string;
    tags?: string[];
  };
  onSave: (title: string, content: string, tags: string[]) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

export default function NoteEditor({ note, onSave, onCancel, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSave(title, content, tags);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Редактирование заметки</CardTitle>
          <div className="flex gap-2">
            {note?.id && onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete} disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Заголовок
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите заголовок заметки..."
              className="text-lg font-semibold mt-1"
            />
          </div>

          <div>
            <Label htmlFor="content" className="text-sm font-medium">
              Содержимое
            </Label>
            <div className="mt-1" data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(val = '') => setContent(val)}
                height={400}
                preview="edit"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium flex items-center">
                <Hash className="w-4 h-4 mr-1" />
                Теги
              </Label>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Добавить тег..."
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                />
                <Tag className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
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

            <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md">
              {tags.length === 0 ? (
                <span className="text-sm text-muted-foreground">Нет тегов</span>
              ) : (
                tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full hover:bg-secondary-foreground/25"
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
