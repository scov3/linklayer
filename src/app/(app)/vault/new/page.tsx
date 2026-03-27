'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useVaultStore } from '@/store/vault-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewVaultPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createVault } = useVaultStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newVault = await createVault(name, description);
      router.push(`/vault/${newVault.id}`);
    } catch (error) {
      console.error('Error creating vault:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Создать новое хранилище</CardTitle>
          <CardDescription>
            Хранилище - это контейнер для ваших заметок и графов знаний
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Название хранилища</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите название хранилища"
                required
                minLength={1}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание (необязательно)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Кратко опишите назначение этого хранилища"
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Создание...' : 'Создать хранилище'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
