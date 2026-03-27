'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVaultStore } from '@/store/vault-store';
import { BarChart3, FileText, Network, NotebookText, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const { vaults, isLoading } = useVaultStore();

  const [stats] = useState({
    vaults: vaults.length,
    notes: 0, // Пока нет функциональности для подсчета заметок
    connections: 0, // Пока нет функциональности для подсчета связей
    shared: vaults.filter((v) => v.is_shared).length,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Добро пожаловать в LinkLayer</h1>
        <p className="text-muted-foreground mt-2">
          Умный блокнот с системой графов для управления знаниями
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Мои хранилища</CardTitle>
                <Button asChild>
                  <Link href="/vault/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Создать
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {vaults.length === 0 ? (
                <div className="text-center py-8">
                  <NotebookText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 font-semibold">Нет хранилищ</h3>
                  <p className="text-muted-foreground mt-1">
                    Создайте свое первое хранилище для начала работы
                  </p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/vault/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Создать хранилище
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vaults.map((vault) => (
                    <Link key={vault.id} href={`/vault/${vault.id}`} className="block">
                      <Card className="hover:bg-accent/50 transition-colors">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <NotebookText className="h-5 w-5 text-primary" />
                            {vault.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {vault.description || 'Хранилище знаний'}
                          </p>
                          <div className="mt-3 flex items-center text-xs text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            {vault.is_shared ? 'Общее' : 'Личное'}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Последние заметки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto" />
                <h3 className="mt-4 font-semibold">Нет заметок</h3>
                <p className="mt-2">Создайте первую заметку в одном из хранилищ</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Быстрый старт</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/vault/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Создать хранилище
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="#">
                    <NotebookText className="h-4 w-4 mr-2" />
                    Импортировать заметки
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="#">
                    <Network className="h-4 w-4 mr-2" />
                    Посмотреть пример
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                  <BarChart3 className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold">{stats.vaults}</span>
                  <span className="text-xs text-muted-foreground">Хранилища</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold">{stats.notes}</span>
                  <span className="text-xs text-muted-foreground">Заметки</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                  <Network className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold">{stats.connections}</span>
                  <span className="text-xs text-muted-foreground">Связи</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold">{stats.shared}</span>
                  <span className="text-xs text-muted-foreground">Общие</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Что нового?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <div className="h-2 w-2 bg-primary rounded-full mt-1.5 mr-2" />
                  <span>Создавайте хранилища для организации знаний</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 bg-primary rounded-full mt-1.5 mr-2" />
                  <span>Связывайте заметки в графы знаний</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 bg-primary rounded-full mt-1.5 mr-2" />
                  <span>Работайте совместно в общих хранилищах</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
