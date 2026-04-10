import { Button } from '@/components/ui/button';
import { MessageSquare, Network, NotebookText, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  vaults?: Array<{
    id: string;
    name: string;
  }>;
}

export default function Sidebar({ vaults = [] }: SidebarProps) {
  return (
    <aside className="hidden border-r md:block w-64 h-full bg-background/50 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <Button asChild className="w-full">
            <Link href="/vault/new">
              <Plus className="h-4 w-4 mr-2" />
              Новое хранилище
            </Link>
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Мои хранилища
            </h3>

            {vaults.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Нет хранилищ</div>
            ) : (
              vaults.map((vault) => (
                <Link
                  key={vault.id}
                  href={`/vault/${vault.id}`}
                  className="block px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <NotebookText className="h-4 w-4" />
                    {vault.name}
                  </span>
                </Link>
              ))
            )}
          </div>

          <div className="mt-6 space-y-1">
            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6">
              Навигация
            </h3>
            <Link
              href="/vault"
              className="block px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
            >
              <span className="flex items-center gap-2">
                <NotebookText className="h-4 w-4" />
                Все хранилища
              </span>
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Настройки
              </span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Пользователь</p>
              <p className="text-xs text-muted-foreground truncate">user@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
