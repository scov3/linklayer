'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">Управление профилем и настройками приложения</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Навигация</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start">
                  Профиль
                </Button>
                <Button variant="ghost" className="justify-start">
                  Уведомления
                </Button>
                <Button variant="ghost" className="justify-start">
                  Конфиденциальность
                </Button>
                <Button variant="ghost" className="justify-start">
                  Темы
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
              <CardDescription>Обновите информацию вашего профиля</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input id="name" defaultValue="Пользователь" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="user@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">О себе</Label>
                  <Textarea id="bio" placeholder="Расскажите немного о себе..." rows={3} />
                </div>

                <div className="pt-4">
                  <Button>Сохранить изменения</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
