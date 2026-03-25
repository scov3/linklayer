# Technical Context

## Технический стек

### Frontend
- **Framework**: React 18+
- **Meta-framework**: Next.js 14+
- **Язык**: TypeScript
- **Пакетный менеджер**: Bun
- **Линтинг**: Biome
- **Стилизация**: TailwindCSS / CSS Modules
- **Граф (Режим 1)**: D3.js или Cytoscape.js
- **Граф (Режим 2)**: Babylon.js или Three.js (с физическим движком)
- **Состояние**: Redux Toolkit / Zustand
- **HTTP клиент**: Axios / Fetch API
- **Форматирование**: Prettier (через Biome)

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **БД**: PostgreSQL (через Supabase)
- **Аутентификация**: Supabase Auth (OAuth)
- **Real-time**: Supabase Realtime / WebSocket
- **Хранилище файлов**: Supabase Storage
- **Валидация**: Zod / Joi

### DevOps и инструменты
- **Версионирование**: Git
- **Хостинг**: Vercel (рекомендуется для Next.js)
- **БД хостинг**: Supabase (PostgreSQL)
- **CI/CD**: GitHub Actions (или GitLab CI)
- **Мониторинг**: TBD (Sentry для ошибок)

## Архитектура приложения

### Структура проекта
```
linklayer/
├── .github/
│   └── workflows/          # CI/CD конфигурация
├── .kiro/
│   ├── specs/              # Спецификации проекта
│   ├── steering/           # Рекомендации для разработки
│   └── settings/           # Настройки Kiro
├── docs/                   # Документация
│   ├── PRD.md             # Product Requirements Document
│   ├── COLLABORATION_ROADMAP.md  # План командных функций
│   └── README.md          # Техническая документация
├── memory_bank/           # Система памяти проекта
├── public/                # Статические файлы
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/          # Страницы аутентификации
│   │   ├── dashboard/     # Главная страница
│   │   ├── vault/         # Страницы хранилища
│   │   └── api/           # API routes
│   ├── components/        # React компоненты
│   │   ├── Editor/        # Редактор заметок
│   │   ├── Graph/         # Компоненты графа
│   │   ├── Chat/          # Компоненты чата
│   │   └── Common/        # Общие компоненты
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Утилиты и хелперы
│   │   ├── supabase.ts    # Supabase клиент
│   │   ├── auth.ts        # Функции аутентификации
│   │   └── utils.ts       # Общие утилиты
│   ├── types/             # TypeScript типы
│   ├── store/             # Redux/Zustand store
│   └── styles/            # Глобальные стили
├── tests/                 # Тесты
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example           # Пример переменных окружения
├── biome.json             # Конфигурация Biome
├── next.config.js         # Конфигурация Next.js
├── tsconfig.json          # Конфигурация TypeScript
├── package.json           # Зависимости проекта
└── README.md              # Основная документация
```

## Ключевые технические решения

### 1. Хранение заметок в Markdown
- **Причина**: Стандартный формат, легко экспортировать/импортировать
- **Реализация**: Заметки хранятся как текст в БД, при экспорте сохраняются как .md файлы
- **Преимущества**: Простота, совместимость, возможность версионирования

### 2. Real-time синхронизация
- **Причина**: Для совместной работы нужна синхронизация в реальном времени
- **Реализация**: Supabase Realtime + WebSocket
- **Альтернативы**: Socket.io, Firebase Realtime Database

### 3. Два режима графов
- **Режим 1 (Классический)**: D3.js или Cytoscape.js
  - Простая визуализация
  - Быстрая отрисовка
  - Подходит для больших графов
  
- **Режим 2 (Физический)**: Babylon.js или Three.js
  - Интерактивный граф с физикой
  - Более красивая визуализация
  - Может быть медленнее на больших графах

### 4. Аутентификация
- **Причина**: Нужна безопасная аутентификация
- **Реализация**: Supabase Auth с OAuth (Google, GitHub, Microsoft)
- **Преимущества**: Безопасность, простота, не нужно хранить пароли

### 5. Управление состоянием
- **Причина**: Сложное состояние приложения (граф, заметки, пользователи)
- **Реализация**: Redux Toolkit или Zustand
- **Выбор**: Zustand для простоты, Redux Toolkit для масштабируемости

## Ограничения и масштабируемость

### Текущие ограничения (TBD с Supabase)
- Максимальный размер одной заметки: *TBD*
- Максимальное количество заметок в хранилище: *TBD*
- Максимальный размер хранилища на пользователя: *TBD*
- Максимальное количество соавторов в хранилище: *TBD*

### Масштабируемость
- **БД**: Supabase автоматически масштабируется
- **Frontend**: Оптимизация графа для больших наборов данных
- **Real-time**: WebSocket может быть узким местом при большом количестве пользователей
- **Хранилище**: Supabase Storage масштабируется автоматически

## Производительность

### Оптимизация графа
- Виртуализация узлов (отрисовка только видимых)
- Кэширование вычислений
- Использование Web Workers для физического движка
- Оптимизация алгоритмов поиска

### Оптимизация редактора
- Debouncing при сохранении
- Локальное кэширование
- Lazy loading компонентов

### Оптимизация сети
- Pagination для списков
- Compression данных
- CDN для статических файлов

## Безопасность

### Аутентификация
- OAuth через Supabase
- JWT токены
- Secure cookies

### Авторизация
- Row-level security (RLS) в PostgreSQL
- Проверка прав доступа на сервере
- Валидация входных данных

### Защита данных
- HTTPS для всех соединений
- CORS настройки
- SQL injection protection (через Supabase)
- XSS protection (React автоматически)

## Интеграции

### Supabase
- PostgreSQL БД
- OAuth аутентификация
- Real-time синхронизация
- File storage

### OAuth провайдеры
- Google
- GitHub
- Microsoft (опционально)

## Известные вызовы и решения

### Вызов 1: Производительность графа при большом количестве узлов
- **Решение**: Виртуализация, Web Workers, оптимизация алгоритмов

### Вызов 2: Синхронизация в реальном времени при конфликтах
- **Решение**: Last-write-wins для MVP, CRDT для будущих версий

### Вызов 3: Масштабируемость при большом количестве пользователей
- **Решение**: Использование Supabase, оптимизация WebSocket

### Вызов 4: Мобильная версия
- **Решение**: Отложить на Фазу 5, использовать React Native позже

## Переменные окружения

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Инструменты разработки

### Локальная разработка
```bash
# Установка зависимостей
bun install

# Запуск dev сервера
bun run dev

# Линтинг и форматирование
bun run lint
bun run format

# Тесты
bun run test
bun run test:watch

# Сборка
bun run build
```

### Supabase локально
```bash
# Установка Supabase CLI
npm install -g supabase

# Запуск локального Supabase
supabase start

# Миграции
supabase migration new <name>
supabase db push
```

---

**Документ подготовлен:** 2026-03-14
