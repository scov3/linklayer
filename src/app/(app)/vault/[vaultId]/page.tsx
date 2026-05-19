'use client';

import NoteEditor from '@/components/notes/note-editor';
import NoteList from '@/components/notes/note-list';
import { ConfirmDialog, MessageDialog } from '@/components/ui/app-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotesStore } from '@/store/notes-store';
import { useVaultStore } from '@/store/vault-store';
import {
  Filter,
  MessageSquare,
  Network,
  NotebookText,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VaultPage() {
  const params = useParams<{ vaultId: string }>();
  const router = useRouter();
  const vaultId = params.vaultId;
  const { currentVault, fetchVaultById, isCurrentVaultLoading, deleteVault } = useVaultStore();
  const {
    notes,
    currentNote,
    isLoading: isNotesLoading,
    error: notesError,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    setCurrentNote,
  } = useNotesStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  type EditableNote = Partial<(typeof notes)[number]> & {
    title: string;
    content: string;
    tags?: Array<{ name: string }>;
  };
  const [editingNote, setEditingNote] = useState<EditableNote | null>(null);
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [isDeleteVaultOpen, setIsDeleteVaultOpen] = useState(false);
  const [isDeletingVault, setIsDeletingVault] = useState(false);
  const [message, setMessage] = useState<{ title: string; description: string } | null>(null);

  // Загрузка информации о конкретном хранилище
  useEffect(() => {
    if (vaultId) {
      void fetchVaultById(vaultId).catch((error) => {
        console.error('[VaultPage] fetchVaultById error:', error);
      });
      void fetchNotes(vaultId).catch((error) => {
        console.error('[VaultPage] fetchNotes error:', error);
      });
    }
  }, [vaultId, fetchVaultById, fetchNotes]);

  const tagNames = (note: EditableNote | null) =>
    note?.tags?.map((tag) => tag.name).filter(Boolean) || [];

  const handleCreateNote = () => {
    const draft = {
      title: 'Новая заметка',
      content: '# Новая заметка\n\nНачните писать здесь...',
      tags: [],
    };

    setActiveTab('notes');
    setCurrentNote(null);
    setEditingNote(draft);
  };

  const handleSelectNote = (note: (typeof notes)[number]) => {
    setCurrentNote(note);
    setEditingNote(null);
  };

  const handleEditNote = (note: (typeof notes)[number]) => {
    setCurrentNote(note);
    setEditingNote(note);
  };

  const handleSaveNote = async (title: string, content: string, tags: string[]) => {
    if (editingNote?.id) {
      await updateNote(editingNote.id, { title, content }, tags);
      setEditingNote(null);
      return;
    }

    const createdNote = await createNote(vaultId, title, content, tags);
    setCurrentNote(createdNote);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
    if (editingNote?.id === noteId) {
      setEditingNote(null);
    }
  };

  const handleConfirmDeleteNote = async () => {
    if (!noteToDeleteId) return;

    setIsDeletingNote(true);
    try {
      await handleDeleteNote(noteToDeleteId);
      setNoteToDeleteId(null);
    } catch (error) {
      console.error('[VaultPage] delete note error:', error);
      setMessage({ title: 'Ошибка удаления', description: 'Не удалось удалить заметку.' });
    } finally {
      setIsDeletingNote(false);
    }
  };

  const handleDeleteVault = async () => {
    setIsDeletingVault(true);
    try {
      await deleteVault(vaultId);
      router.push('/vault');
    } catch (error) {
      console.error('[VaultPage] delete vault error:', error);
      setMessage({ title: 'Ошибка удаления', description: 'Не удалось удалить хранилище.' });
    } finally {
      setIsDeletingVault(false);
      setIsDeleteVaultOpen(false);
    }
  };

  const vaultTitle = currentVault?.name || 'Хранилище';
  const vaultDescription = currentVault?.description || `Хранилище "${vaultTitle}"`;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {vaultTitle}
              {!isCurrentVaultLoading && currentVault && (
                <Badge variant="secondary" className="capitalize">
                  {currentVault.is_shared ? 'Общее' : 'Личное'}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">{vaultDescription}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Поиск
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Фильтр
            </Button>
            <Button onClick={handleCreateNote}>
              <Plus className="w-4 h-4 mr-2" />
              Новая заметка
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          <button
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="flex items-center gap-2">
              <NotebookText className="w-4 h-4" />
              Обзор
            </div>
          </button>
          <button
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            <div className="flex items-center gap-2">
              <NotebookText className="w-4 h-4" />
              Заметки
            </div>
          </button>
          <button
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'graph'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
            onClick={() => setActiveTab('graph')}
          >
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Граф
            </div>
          </button>
          <button
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chat'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Чат
            </div>
          </button>
          <button
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
            onClick={() => setActiveTab('members')}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Участники
            </div>
          </button>
          <button
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Настройки
            </div>
          </button>
        </nav>
      </div>

      <div className="py-4">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Заметки</span>
                  <NotebookText className="w-5 h-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{notes.length}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {notes.length > 0 ? `Последняя: ${notes[0]?.title}` : 'Нет заметок'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Связи</span>
                  <Network className="w-5 h-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground mt-2">Связи между заметками</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Участники</span>
                  <Users className="w-5 h-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {isCurrentVaultLoading ? '...' : currentVault?.is_shared ? '3' : '1'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {isCurrentVaultLoading
                    ? 'Загрузка...'
                    : currentVault?.is_shared
                      ? 'Совместная работа'
                      : 'Личное хранилище'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <Card>
              <CardContent className="p-4">
                {notesError && <p className="mb-3 text-sm text-destructive">{notesError}</p>}
                {isNotesLoading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Загрузка заметок...
                  </div>
                ) : (
                  <NoteList
                    notes={notes}
                    currentNoteId={currentNote?.id || editingNote?.id}
                    onSelectNote={handleSelectNote}
                    onEditNote={handleEditNote}
                    onDeleteNote={setNoteToDeleteId}
                    onCreateNew={handleCreateNote}
                  />
                )}
              </CardContent>
            </Card>

            {editingNote ? (
              <NoteEditor
                note={{
                  id: editingNote.id,
                  title: editingNote.title,
                  content: editingNote.content,
                  tags: tagNames(editingNote),
                }}
                onSave={handleSaveNote}
                onCancel={() => setEditingNote(null)}
                onDelete={
                  editingNote.id ? () => handleDeleteNote(editingNote.id as string) : undefined
                }
                onRequestDelete={
                  editingNote.id ? () => setNoteToDeleteId(editingNote.id as string) : undefined
                }
              />
            ) : currentNote ? (
              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{currentNote.title}</CardTitle>
                    {currentNote.tags && currentNote.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {currentNote.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary">
                            #{tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => handleEditNote(currentNote)}>
                    Редактировать
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 font-sans text-sm leading-7">
                    {currentNote.content || 'Пустая заметка'}
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <div className="flex min-h-[420px] flex-col items-center justify-center text-center text-muted-foreground">
                    <NotebookText className="h-12 w-12" />
                    <h3 className="mt-4 font-semibold text-foreground">
                      Выберите или создайте заметку
                    </h3>
                    <p className="mt-2 max-w-sm text-sm">
                      Редактор поддерживает Markdown и теги. Создайте заметку, чтобы начать.
                    </p>
                    <Button className="mt-4" onClick={handleCreateNote}>
                      <Plus className="mr-2 h-4 w-4" />
                      Создать заметку
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'graph' && (
          <Card>
            <CardHeader>
              <CardTitle>Визуализация графа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Network className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 font-semibold">Граф знаний</h3>
                  <p className="mt-2 text-muted-foreground">
                    На текущем этапе доступно только базовое отображение графа без редактора.
                  </p>
                  <div className="flex gap-2 mt-4 justify-center">
                    <Button variant="outline">Классический просмотр</Button>
                    <Button variant="outline" disabled>
                      Физический режим скоро
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'chat' && (
          <Card>
            <CardHeader>
              <CardTitle>Чат хранилища</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto" />
                <h3 className="mt-4 font-semibold">Чат хранилища</h3>
                <p className="mt-2">Общение с участниками хранилища</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'members' && (
          <Card>
            <CardHeader>
              <CardTitle>Участники хранилища</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto" />
                <h3 className="mt-4 font-semibold">Участники</h3>
                <p className="mt-2">Добавление и управление участниками хранилища</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Настройки хранилища</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">Название хранилища</h4>
                    <p className="text-sm text-muted-foreground">{vaultTitle}</p>
                  </div>
                  <Button variant="outline">Редактировать</Button>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">Тип доступа</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentVault?.is_shared ? 'Общее хранилище' : 'Личное хранилище'}
                    </p>
                  </div>
                  <Button variant="outline">Изменить</Button>
                </div>

                <div className="flex justify-between items-center p-4 border border-destructive/30 rounded-md bg-destructive/5">
                  <div>
                    <h4 className="font-medium text-destructive">Удалить хранилище</h4>
                    <p className="text-sm text-muted-foreground">
                      Хранилище, заметки и связанные данные будут удалены без восстановления.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={() => setIsDeleteVaultOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(noteToDeleteId)}
        title="Удалить заметку?"
        description="Это действие нельзя отменить. Заметка и ее связи с тегами будут удалены."
        confirmLabel="Удалить"
        destructive
        loading={isDeletingNote}
        onConfirm={handleConfirmDeleteNote}
        onCancel={() => setNoteToDeleteId(null)}
      />

      <ConfirmDialog
        open={isDeleteVaultOpen}
        title="Удалить хранилище?"
        description={`Вы собираетесь удалить "${vaultTitle}". Это действие нельзя отменить.`}
        confirmLabel="Удалить хранилище"
        destructive
        loading={isDeletingVault}
        onConfirm={handleDeleteVault}
        onCancel={() => setIsDeleteVaultOpen(false)}
      />

      <MessageDialog
        open={Boolean(message)}
        title={message?.title || ''}
        description={message?.description}
        onClose={() => setMessage(null)}
      />
    </div>
  );
}
