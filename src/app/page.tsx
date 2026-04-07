import { Button } from '@/components/ui/button';
import { ArrowRight, Github, Network, NotebookText } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero section */}
      <section className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center">
          <div className="inline-flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full text-sm mb-6">
            <span className="bg-primary w-2 h-2 rounded-full"></span>
            <span>Alpha версия</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            LinkLayer
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Умный блокнот с системой графов для эффективного управления знаниями и идеями
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Начать использовать
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                Создать аккаунт
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-muted/30 p-6 rounded-xl">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <NotebookText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Хранилища знаний</h3>
              <p className="text-sm text-muted-foreground">
                Организуйте информацию в структурированные хранилища
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Network className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Граф связей</h3>
              <p className="text-sm text-muted-foreground">
                Визуализируйте связи между вашими идеями
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Github className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Открытый исходный код</h3>
              <p className="text-sm text-muted-foreground">
                Прозрачность и контроль над вашими данными
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} LinkLayer. Все права защищены.</p>
      </footer>
    </main>
  );
}
