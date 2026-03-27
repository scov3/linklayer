import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash, Calendar } from 'lucide-react'
import { Note } from '@/lib/supabase/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface NoteListProps {
  notes: Note[]
  currentNoteId?: string | null
  onSelectNote: (note: Note) => void
  onEditNote: (note: Note) => void
  onDeleteNote: (noteId: string) => void
  onCreateNew: () => void
}

export default function NoteList({ 
  notes, 
  currentNoteId, 
  onSelectNote, 
  onEditNote, 
  onDeleteNote, 
  onCreateNew 
}: NoteListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Заметки</h2>
        <Button onClick={onCreateNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Новая
        </Button>
      </div>
      
      {notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Нет заметок</p>
          <p className="text-sm mt-1">Создайте первую заметку</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Card 
              key={note.id} 
              className={`cursor-pointer hover:bg-accent transition-colors ${
                currentNoteId === note.id ? 'bg-accent border-primary' : ''
              }`}
              onClick={() => onSelectNote(note)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <span className="truncate">{note.title}</span>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditNote(note)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteNote(note.id)
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(note.updated_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                </div>
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}