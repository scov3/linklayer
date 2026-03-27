'use client'

import { useEffect, useRef } from 'react'

interface GraphViewProps {
  vaultId: string
}

export default function GraphView({ vaultId }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // В дальнейшем тут будет реализация графа
    // Пока просто заглушка
    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <div class="h-full w-full flex items-center justify-center">
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-2">Графовое представление</h3>
            <p class="text-muted-foreground mb-4">Хранилище: ${vaultId}</p>
            <p class="text-sm text-muted-foreground">Компонент визуализации графа будет реализован далее</p>
          </div>
        </div>
      `
    }
  }, [vaultId])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg border bg-muted"
    />
  )
}