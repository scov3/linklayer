import { ThemeToggle } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MessageSquare, Network, NotebookText, Settings, User } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Открыть меню</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="grid gap-2 py-4">
                <Link href="/" className="px-4 py-2 rounded-md hover:bg-accent">
                  <span className="flex items-center gap-2">
                    <NotebookText className="h-4 w-4" />
                    Хранилища
                  </span>
                </Link>
                <Link href="/vault/new" className="px-4 py-2 rounded-md hover:bg-accent">
                  <span className="flex items-center gap-2">
                    <NotebookText className="h-4 w-4" />
                    Создать хранилище
                  </span>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Network className="h-6 w-6" />
            <span>LinkLayer</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Профиль</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
