'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useVaultStore } from '@/store/vault-store'
import { useNotesStore } from '@/store/notes-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  NotebookIcon, 
  NetworkIcon, 
  MessageSquareIcon, 
  SettingsIcon,
  UsersIcon 
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Динамический импорт компонентов графа для оптимизации
const GraphView = dynamic(() => import('@/components/graph/graph-view'), { ssr: false })

export default function VaultPage() {
  const params = useParams<{ vaultId: string }>()
  const router = useRouter()
  const vaultId = params.vaultId
  
  const { currentVault, updateVault, deleteVault } = useVaultStore()
  const { fetchNotes } = useNotesStore()
  const [activeTab, setActiveTab] = useState('graph')

  // Загрузка данных хранилища при необходимости
  const handleNotesTab = () => {
    setActiveTab('notes')
    if (vaultId) {
      fetchNotes(vaultId)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {currentVault?.name || 'Загрузка...'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentVault?.description || `Хранилище ${vaultId}`}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/vault/${vaultId}/notes`)}>
              <NotebookIcon className="w-4 h-4 mr-2" />
              Заметки
            </Button>
            <Button variant="outline" onClick={() => router.push(`/vault/${vaultId}/settings`)}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Настройки
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="graph" onClick={() => setActiveTab('graph')}>
            <NetworkIcon className="w-4 h-4 mr-2" />
            Граф
          </TabsTrigger>
          <TabsTrigger value="notes" onClick={handleNotesTab}>
            <NotebookIcon className="w-4 h-4 mr-2" />
            Заметки
          </TabsTrigger>
          <TabsTrigger value="chat" onClick={() => setActiveTab('chat')}>
            <MessageSquareIcon className="w-4 h-4 mr-2" />
            Чат
          </TabsTrigger>
          <TabsTrigger value="members" onClick={() => setActiveTab('members')}>
            <UsersIcon className="w-4 h-4 mr-2" />
            Участники
          </TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Визуализация графа</CardTitle>
            </CardHeader>
            <CardContent className="h-[600px]">
              <GraphView vaultId={vaultId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Управление заметками</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-lg mb-2">Заметки</p>
                <p className="text-muted-foreground mb-4">
                  Здесь вы можете создавать и редактировать заметки
                </p>
                <Button onClick={() => router.push(`/vault/${vaultId}/notes`)}>
                  Перейти к заметкам
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Чат хранилища</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-lg mb-2">Чат</p>
                <p className="text-muted-foreground mb-4">
                  Общение с участниками хранилища
                </p>
                <p className="text-sm text-muted-foreground">
                  Функция будет реализована в следующей версии
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Участники хранилища</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-lg mb-2">Участники</p>
                <p className="text-muted-foreground mb-4">
                  Управление доступом к хранилищу
                </p>
                <p className="text-sm text-muted-foreground">
                  Функция будет реализована в следующей версии
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}