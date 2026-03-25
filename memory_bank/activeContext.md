# Active Context

## Текущий фокус
**Статус:** Авторизация работает, готовимся к графам  
**Дата:** 2026-03-25

## Что было сделано в этой сессии

### 1. Настройка окружения (DLV-003)
- ✅ Создание конфигурационных файлов
  - package.json, tsconfig.json, next.config.js
  - biome.json, tailwind.config.ts, postcss.config.js
  - .env.example, .gitignore
- ✅ Создание структуры директорий src/
- ✅ Настройка CSS variables для темы

### 2. Фиксация библиотек
| Категория | Библиотека |
|-----------|------------|
| Graph Mode 1 | Cytoscape.js |
| Graph Mode 2 | Three.js + d3-force |
| State Management | Zustand |
| Markdown | react-markdown + remark-gfm |
| Markdown Editor | @uiw/react-md-editor |
| UI Components | Radix UI |
| Icons | Lucide React |
| Validation | Zod |

## Следующие шаги

### Фаза 1: Аутентификация (DLV-004)
- Настроить Supabase client
- Интеграция Supabase Auth
- OAuth flows (Google, GitHub)
- Protected routes
- Zustand auth store

### Фаза 2: Система заметок (DLV-005)
- Notes CRUD
- Markdown editor
- Auto-save

## Активные решения (фиксированные)

### Библиотеки графов
- **Mode 1 (Classical)**: Cytoscape.js - специализирована для графов
- **Mode 2 (Physics)**: Three.js + d3-force - легковеснее Babylon.js

### State Management
- **Zustand** - простота, отличный TS, легковесный

### UI Framework
- **Radix UI** - headless components, accessible
- **TailwindCSS** - стилизация

## Приоритеты

1. **Высокий**: Инициализировать Next.js проект (DLV-003)
2. **Высокий**: Настроить Supabase и OAuth (DLV-003)
3. **Средний**: Реализовать аутентификацию (DLV-004)
4. **Средний**: Реализовать систему заметок (DLV-005)

## Известные неопределенности

- Ограничения Supabase (размер заметок, хранилища)
- Производительность Graph Mode 2 при 1000+ нодов

## Риски

- **Graph Mode 2**: Физическая симуляция может быть тяжёлой
- **Real-time**: WebSocket может быть узким местом

---

**Последнее обновление:** 2026-03-25
