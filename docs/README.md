# LinkLayer - Техническая документация

## Обзор

**LinkLayer** — это веб-приложение для управления знаниями с системой графов, вдохновленное Obsidian, но с более интуитивным интерфейсом.

## Документация

### Основные документы

1. **[PRD.md](./PRD.md)** - Product Requirements Document
   - Полная спецификация требований
   - Архитектура данных
   - Технический стек
   - Критерии успеха MVP

2. **[COLLABORATION_ROADMAP.md](./COLLABORATION_ROADMAP.md)** - План командных функций
   - Видение для Фазы 3+
   - Система ролей и доступа
   - Синхронизация в реальном времени
   - Архитектура для совместной работы

### Дополнительные документы

- **[DESIGN.md](./DESIGN.md)** - Техническое проектирование (архитектура, компоненты, API)
- **API.md** (TBD) - Спецификация API
- **DEPLOYMENT.md** (TBD) - Инструкции по развертыванию
- **CONTRIBUTING.md** (TBD) - Руководство для разработчиков

## Структура проекта

```
linklayer/
├── docs/                   # Документация
├── memory_bank/            # Система памяти проекта
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React компоненты
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Утилиты
│   ├── types/             # TypeScript типы
│   ├── store/             # State management
│   └── styles/            # Стили
├── tests/                 # Тесты
├── public/                # Статические файлы
└── package.json           # Зависимости
```

## Технический стек

### Frontend
- React 18+
- Next.js 14+
- TypeScript
- TailwindCSS
- Zustand (state management)
- Cytoscape.js (граф режим 1)
- Three.js + d3-force (граф режим 2)
- Radix UI (components)
- Lucide React (icons)
- react-markdown (markdown rendering)
- @uiw/react-md-editor (markdown editor)
- Zod (validation)

### Backend
- Next.js API Routes
- Node.js

### База данных
- PostgreSQL (Supabase)
- Supabase Auth (OAuth)
- Supabase Realtime (WebSocket)

### DevOps
- Bun (пакетный менеджер)
- Biome (линтинг)
- Vercel (хостинг)
- GitHub Actions (CI/CD)

## Ключевые возможности MVP

### Управление заметками
- ✅ Создание, редактирование, удаление заметок
- ✅ Формат Markdown
- ✅ Импорт/экспорт .md файлов
- ✅ Система тегов

### Граф и визуализация
- ✅ Два режима графов (классический и физический)
- ✅ Ручное соединение узлов
- ✅ Закрепление заметок
- ✅ Поиск и фильтрация по тегам

### Совместная работа
- ✅ Личные и совместные хранилища
- ✅ Добавление соавторов
- ✅ Встроенный чат
- ✅ Синхронизация в реальном времени

## Дорожная карта

### Фаза 1: MVP (текущая)
- Личные хранилища
- Система заметок и тегов
- Два режима графов
- Базовая совместная работа
- Импорт/экспорт .md

### Фаза 2: Расширенные функции
- История версий
- Встроенные изображения
- Система комментариев
- Расширенные типы связей

### Фаза 3: Полная совместная работа
- Система ролей (owner, editor, viewer)
- Разрешение конфликтов
- Расширенный чат
- Уведомления

### Фаза 4: Интеграции
- Экспорт в JSON, CSV
- Синхронизация с облачными хранилищами
- API для интеграций

### Фаза 5: Мобильность
- Мобильная версия
- Offline-first синхронизация

### Фаза 6: Монетизация
- Платные планы
- Командные планы

## Начало разработки

### Требования
- Node.js 18+
- Bun (пакетный менеджер)
- Supabase аккаунт

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/scov3/linklayer.git
cd linklayer

# Установка зависимостей
bun install

# Настройка переменных окружения
cp .env.example .env.local

# Запуск dev сервера
bun run dev
```

### Переменные окружения

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Команды разработки

```bash
# Запуск dev сервера
bun run dev

# Сборка проекта
bun run build

# Запуск production сервера
bun run start

# Линтинг и форматирование
bun run lint
bun run format

# Тесты
bun run test
bun run test:watch

# Тесты E2E
bun run test:e2e
```

## Архитектура данных

### Основные таблицы

#### User
```sql
- id (UUID, PK)
- username (string)
- email (string)
- auth_provider (string)
- created_at (timestamp)
```

#### Vault
```sql
- id (UUID, PK)
- name (string)
- owner_id (UUID, FK)
- is_shared (boolean)
- created_at (timestamp)
```

#### Note
```sql
- id (UUID, PK)
- vault_id (UUID, FK)
- title (string)
- content (text, markdown)
- created_at (timestamp)
- created_by (UUID, FK)
```

#### Link
```sql
- id (UUID, PK)
- source_note_id (UUID, FK)
- target_note_id (UUID, FK)
- link_type (string)
- created_at (timestamp)
```

#### Tag
```sql
- id (UUID, PK)
- vault_id (UUID, FK)
- name (string)
- color (string)
```

#### VaultMember
```sql
- id (UUID, PK)
- vault_id (UUID, FK)
- user_id (UUID, FK)
- role (string: owner, editor)
- joined_at (timestamp)
```

#### ChatMessage
```sql
- id (UUID, PK)
- vault_id (UUID, FK)
- user_id (UUID, FK)
- content (text)
- attached_note_id (UUID, FK, optional)
- created_at (timestamp)
```

## API Endpoints

### Vaults
```
GET    /api/vaults              - List user's vaults
POST   /api/vaults              - Create new vault
GET    /api/vaults/[id]         - Get vault details
PUT    /api/vaults/[id]         - Update vault
DELETE /api/vaults/[id]         - Delete vault
```

### Notes
```
GET    /api/vaults/[id]/notes   - List vault's notes
POST   /api/vaults/[id]/notes   - Create note
GET    /api/notes/[id]          - Get note
PUT    /api/notes/[id]          - Update note
DELETE /api/notes/[id]          - Delete note
```

### Links
```
GET    /api/vaults/[id]/links   - List vault's links
POST   /api/vaults/[id]/links   - Create link
DELETE /api/links/[id]          - Delete link
```

### Tags
```
GET    /api/vaults/[id]/tags    - List vault's tags
POST   /api/vaults/[id]/tags    - Create tag
PUT    /api/tags/[id]           - Update tag
DELETE /api/tags/[id]           - Delete tag
```

### Chat
```
GET    /api/vaults/[id]/chat    - Get chat messages
POST   /api/vaults/[id]/chat    - Send message
```

### Members
```
GET    /api/vaults/[id]/members - List vault members
POST   /api/vaults/[id]/members - Add member
DELETE /api/vaults/[id]/members/[userId] - Remove member
```

## Безопасность

- OAuth аутентификация через Supabase
- Row-level security (RLS) в PostgreSQL
- HTTPS для всех соединений
- CORS настройки
- Валидация входных данных (Zod)
- JWT токены в secure cookies

## Производительность

- Lazy loading компонентов
- Pagination для списков
- Кэширование на клиенте
- Виртуализация графа
- Web Workers для физического движка
- Debouncing при сохранении

## Мониторинг и логирование

- TBD: Sentry для отслеживания ошибок
- TBD: Логирование на сервере
- TBD: Метрики производительности

## Контрибьютинг

Подробные инструкции см. в [CONTRIBUTING.md](./CONTRIBUTING.md) (TBD)

## Лицензия

TBD

## Контакты

- GitHub: https://github.com/scov3/linklayer
- Issues: https://github.com/scov3/linklayer/issues

---

**Последнее обновление:** 2026-03-25
