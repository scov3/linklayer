'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useNotesStore } from '@/store/notes-store'
import { useAuthStore } from '@/store/auth-store'
import { useVaultStore } from '@/store/vault-store'
import NoteEditor from '@/components/notes/note-editor'
import NoteList from '@/components/notes/note-list'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'


export default function VaultNotesPage() {
  const params = useParams<{ vaultId: string }>()
  const vaultId = params.vaultId
  
  const { 
    notes, 
    currentNote, 
    isLoading, 
    error, 
    fetchNotes, 
    createNote, 
    updateNote, 
    deleteNote, 
    setCurrentNote,
    clearNotes
  } = useNotesStore()
  const { user } = useAuthStore()
  const { currentVault, setCurrentVault } = useVaultStore()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      // Перенаправление на страницу входа (реализуется через router в продвинутом варианте)
      return
    }
    
    // Загружаем хранилище и заметки
    async function loadData() {
      // Здесь может быть загрузка конкретного хранилища по ID
      if (vaultId) {
        // Загрузка заметок для данного хранилища
        await fetchNotes(vaultId)
      }
    }
    
    loadData()
    
    // Очистка при выходе
    return () => {
      clearNotes()
    }
  }, [user, vaultId, fetchNotes, clearNotes])

  const handleSelectNote = (note: any) => {
    setCurrentNote(note)
    setIsEditing(false)
  }

  const handleCreateNew = async () => {
    // Создание новой пустой заметки
    const newNote = await createNote(vaultId, 'Новая заметка', '# Новая заметка\n\nВведите содержимое...')
    setCurrentNote(newNote)
    setIsEditing(true)
    setEditingNote(newNote)
  }

  const handleEditNote = (note: any) => {
    setIsEditing(true)
    setEditingNote(note)
  }

  const handleSaveNote = async (title: string, content: string) => {
    if (!editingNote) {
      // Создание новой заметки
      if (currentVault) {
        const newNote = await createNote(currentVault.id, title, content)
        setCurrentNote(newNote)
        setIsEditing(false)
        setEditingNote(null)
      }
    } else {
      // Обновление существующей заметки
      await updateNote(editingNote.id, { title, content })
      setIsEditing(false)
      setEditingNote(null)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId)
    if (currentNote?.id === noteId) {
      setCurrentNote(null)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingNote(null)
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Требуется войти в систему для доступа к заметкам
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Заметки</h1>
        <p className="text-muted-foreground">
          Управление заметками в хранилище {currentVault?.name || vaultId}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="ml-2">Загрузка заметок...</span>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Список заметок */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <NoteList
                  notes={notes}
                  currentNoteId={currentNote?.id}
                  onSelectNote={handleSelectNote}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                  onCreateNew={handleCreateNew}
                />
              </CardContent>
            </Card>
          </div>

          {/* Редактор заметки */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                {isEditing ? (
                  <NoteEditor
                    note={editingNote}
                    onSave={handleSaveNote}
                    onCancel={handleCancelEdit}
                    onDelete={editingNote ? () => handleDeleteNote(editingNote.id) : undefined}
                  />
                ) : currentNote ? (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{currentNote.title}</h2>
                    <Separator className="mb-4" />
                    <div className="prose max-w-none">
                      {currentNote.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-lg text-muted-foreground mb-4">
                      Выберите заметку из списка или создайте новую
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Заметки позволяют структурировать ваши знания и идеи
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}