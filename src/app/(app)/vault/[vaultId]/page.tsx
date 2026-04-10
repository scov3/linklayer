'use client';

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
  Users,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VaultPage() {
  const params = useParams<{ vaultId: string }>();
  const vaultId = params.vaultId;
  const { currentVault, fetchVaultById, isCurrentVaultLoading } = useVaultStore();
  const { notes, fetchNotes } = useNotesStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Загрузка информации о конкретном хранилище
  useEffect(() => {
    if (vaultId) {
      fetchVaultById(vaultId);
      // Также загрузим заметки для этого хранилища
      fetchNotes(vaultId);
    }
  }, [vaultId, fetchVaultById, fetchNotes]);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {isCurrentVaultLoading ? 'Загрузка...' : currentVault?.name || 'Хранилище не найдено'}
              {!isCurrentVaultLoading && currentVault && (
                <Badge variant="secondary" className="capitalize">
                  {currentVault.is_shared ? 'Общее' : 'Личное'}
                </Badge>
              )}
            </h1>
            {!isCurrentVaultLoading && currentVault && (
              <p className="text-muted-foreground mt-1">
                {currentVault.description || `Хранилище "${currentVault.name}"`}
              </p>
            )}
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
            <Button>
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
                ? 'border-[hsl(47,27%,75%)] text-[hsl(47,27%,75%)]'
                : 'border-transparent text-muted-foreground hover:text-[hsl(47,27%,75%)]'
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
                ? 'border-[hsl(47,27%,75%)] text-[hsl(47,27%,75%)]'
                : 'border-transparent text-muted-foreground hover:text-[hsl(47,27%,75%)]'
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
                ? 'border-[hsl(47,27%,75%)] text-[hsl(47,27%,75%)]'
                : 'border-transparent text-muted-foreground hover:text-[hsl(47,27%,75%)]'
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
              activeTab === 'settings'
                ? 'border-[hsl(47,27%,75%)] text-[hsl(47,27%,75%)]'
                : 'border-transparent text-muted-foreground hover:text-[hsl(47,27%,75%)]'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Участники
            </div>
          </button>
          <button
            type="button"
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chat'
                ? 'border-[hsl(47,27%,75%)] text-[hsl(47,27%,75%)]'
                : 'border-transparent text-muted-foreground hover:text-[hsl(47,27%,75%)]'
            }`}
            onClick={() => setActiveTab('chat')}
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
          <Card>
            <CardHeader>
              <CardTitle>Заметки в хранилище</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <NotebookText className="w-12 h-12 mx-auto" />
                <h3 className="mt-4 font-semibold">Нет заметок</h3>
                <p className="mt-2">Создайте свою первую заметку в этом хранилище</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Создать заметку
                </Button>
              </div>
            </CardContent>
          </Card>
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
                    Визуальное представление связей между заметками
                  </p>
                  <div className="flex gap-2 mt-4 justify-center">
                    <Button variant="outline">Классический режим</Button>
                    <Button variant="outline">Физический режим</Button>
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
                    <p className="text-sm text-muted-foreground">
                      {isCurrentVaultLoading
                        ? 'Загрузка...'
                        : currentVault?.name || 'Хранилище не найдено'}
                    </p>
                  </div>
                  <Button variant="outline">Редактировать</Button>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">Тип доступа</h4>
                    <p className="text-sm text-muted-foreground">
                      {isCurrentVaultLoading
                        ? 'Загрузка...'
                        : currentVault?.is_shared
                          ? 'Общее хранилище'
                          : 'Личное хранилище'}
                    </p>
                  </div>
                  <Button variant="outline">Изменить</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
