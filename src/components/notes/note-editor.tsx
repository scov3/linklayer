import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

// Динамический импорт markdown редактора
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
)

interface NoteEditorProps {
  note?: {
    id?: string
    title: string
    content: string
  }
  onSave: (title: string, content: string) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
}

export default function NoteEditor({ note, onSave, onCancel, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return
    
    setIsSaving(true)
    try {
      await onSave(title, content)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название заметки..."
            className="text-xl font-bold border-none focus-visible:ring-0"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(value = '') => setContent(value)}
              height={400}
              preview="edit"
            />
          </div>
          <div className="flex justify-between pt-2">
            <div>
              {note?.id && onDelete && (
                <Button
                  onClick={onDelete}
                  variant="destructive"
                  disabled={isSaving}
                >
                  Удалить
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}