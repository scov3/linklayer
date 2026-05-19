'use client';

import { MessageDialog, PromptDialog } from '@/components/ui/app-dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useVaultStore } from '@/store/vault-store';
import { FolderOpen, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function VaultPage() {
  const vaults = useVaultStore((state) => state.vaults);
  const createVault = useVaultStore((state) => state.createVault);
  const isLoading = useVaultStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateVault = async (name: string) => {
    setIsCreating(true);
    try {
      await createVault(name);
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error creating vault:', error);
      setErrorMessage('Не удалось создать хранилище. Попробуйте еще раз.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Пожалуйста, войдите в систему</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">LinkLayer</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Хранилища</h2>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Создать
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Загрузка...</p>
        ) : vaults.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Нет хранилищ. Создайте первое!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vaults.map((vault) => (
              <Link key={vault.id} href={`/vault/${vault.id}`}>
                <div className="p-4 border rounded-lg hover:bg-accent transition cursor-pointer">
                  <h3 className="font-medium">{vault.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vault.description || 'Без описания'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <PromptDialog
        open={isCreateOpen}
        title="Новое хранилище"
        description="Создайте пространство для заметок, тегов и связей."
        label="Название хранилища"
        placeholder="Например: Исследования"
        confirmLabel="Создать"
        loading={isCreating}
        onSubmit={handleCreateVault}
        onCancel={() => setIsCreateOpen(false)}
      />

      <MessageDialog
        open={Boolean(errorMessage)}
        title="Ошибка"
        description={errorMessage || undefined}
        onClose={() => setErrorMessage(null)}
      />
    </div>
  );
}
