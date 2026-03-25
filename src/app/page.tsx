import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">LinkLayer</h1>
        <p className="text-muted-foreground mb-8">
          Умный блокнот с системой графов
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button>Войти</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Регистрация</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
