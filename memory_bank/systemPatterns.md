# System Patterns

## Архитектурные паттерны

### 1. Слоистая архитектура (Layered Architecture)

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │
│  React Components + Next.js Pages   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Business Logic Layer            │
│  Hooks, Services, State Management  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Data Access Layer               │
│  Supabase Client, API Routes        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Database Layer                  │
│  PostgreSQL (Supabase)              │
└─────────────────────────────────────┘
```

### 2. Component-Based Architecture

- **Presentational Components**: Чистые компоненты, только отображение
- **Container Components**: Логика, управление состоянием
- **Custom Hooks**: Переиспользуемая логика

### 3. Real-time Synchronization Pattern

```
Client A          WebSocket          Server          Database
   │                  │                 │                │
   ├─ Edit Note ─────>│                 │                │
   │                  ├─ Broadcast ────>│                │
   │                  │                 ├─ Save ────────>│
   │                  │<─ Confirm ──────┤                │
   │<─ Update ────────┤                 │                │
   │                  │                 │                │
Client B          WebSocket          Server          Database
   │                  │                 │                │
   │<─ Update ────────┤                 │                │
   │                  │                 │                │
```

### 4. Graph Visualization Pattern

#### Режим 1 (Классический)
```
Notes (Nodes)
     ↓
Cytoscape.js
     ↓
SVG Rendering
     ↓
Static Graph Display (cose-bilkent layout)
```

#### Режим 2 (Физический)
```
Notes (Nodes)
     ↓
d3-force (physics simulation)
     ↓
Three.js (WebGL rendering)
     ↓
Interactive Graph Display
```

## Паттерны данных

### 1. Markdown Storage Pattern

```
Database (PostgreSQL)
    ↓
Note.content (Markdown text)
    ↓
Frontend (React)
    ↓
Markdown Parser (remark, marked)
    ↓
HTML Rendering
    ↓
User Display
```

### 2. Real-time Sync Pattern

```
Client State
    ↓
Debounce (500ms)
    ↓
Send to Server
    ↓
Supabase Realtime
    ↓
Broadcast to Other Clients
    ↓
Update Client State
```

### 3. Authentication Flow

```
User
    ↓
OAuth Provider (Google, GitHub)
    ↓
Supabase Auth
    ↓
JWT Token
    ↓
Store in Secure Cookie
    ↓
Include in API Requests
```

## Паттерны взаимодействия

### 1. Note Creation Flow

```
User Input
    ↓
Create Note Component
    ↓
Call API Route (/api/notes/create)
    ↓
Validate Input
    ↓
Save to Database
    ↓
Broadcast via Realtime
    ↓
Update Graph
    ↓
Show Notification
```

### 2. Link Creation Flow

```
User Selects Two Notes
    ↓
Create Link Component
    ↓
Call API Route (/api/links/create)
    ↓
Validate Link Doesn't Exist
    ↓
Save to Database
    ↓
Broadcast via Realtime
    ↓
Update Graph
    ↓
Animate New Link
```

### 3. Collaborative Editing Flow

```
User A Edits Note
    ↓
Debounce (500ms)
    ↓
Send Update to Server
    ↓
Server Validates
    ↓
Save to Database
    ↓
Broadcast via Realtime
    ↓
User B Receives Update
    ↓
Merge with Local State
    ↓
Update UI
```

## Паттерны безопасности

### 1. Row-Level Security (RLS)

```
User Request
    ↓
Check JWT Token
    ↓
Extract User ID
    ↓
Apply RLS Policy
    ↓
Only Return User's Data
```

### 2. Input Validation

```
User Input
    ↓
Client-side Validation (Zod)
    ↓
Send to Server
    ↓
Server-side Validation (Zod)
    ↓
Sanitize Input
    ↓
Save to Database
```

### 3. CORS Protection

```
Browser Request
    ↓
Check Origin
    ↓
Check CORS Headers
    ↓
Allow/Deny Request
```

## Паттерны производительности

### 1. Lazy Loading

```
Page Load
    ↓
Load Critical Components
    ↓
Show Skeleton/Loading
    ↓
Load Non-Critical Components
    ↓
Load Graph Data
    ↓
Render Graph
```

### 2. Pagination

```
Request Notes
    ↓
Limit: 50
    ↓
Offset: 0
    ↓
Return First 50 Notes
    ↓
User Scrolls
    ↓
Request Next 50
    ↓
Append to List
```

### 3. Caching

```
Request Data
    ↓
Check Local Cache
    ↓
If Hit: Return Cached Data
    ↓
If Miss: Fetch from Server
    ↓
Cache Result
    ↓
Return Data
```

### 4. Graph Optimization

```
Large Graph (1000+ nodes)
    ↓
Virtualization
    ↓
Only Render Visible Nodes
    ↓
Use Web Workers for Physics
    ↓
Debounce Rendering
    ↓
Smooth Performance
```

## Паттерны состояния

### 1. Global State (Zustand)

```typescript
// Пример Zustand store
interface VaultStore {
  vaults: Vault[];
  currentVault: Vault | null;
  fetchVaults: () => Promise<void>;
  createVault: (name: string) => Promise<Vault>;
}

// Использование
const { vaults, fetchVaults } = useVaultStore();
```

```
User State
├── id
├── username
├── email
└── auth_provider

Vault State
├── id
├── name
├── notes
├── links
└── tags

UI State
├── selectedNote
├── graphMode
├── searchQuery
└── filters
```

### 2. Local State (React Hooks)

```
Component State
├── Form Input
├── Loading State
├── Error State
└── UI Toggles
```

### 3. Server State (Supabase)

```
Database State
├── Notes
├── Links
├── Tags
├── Users
└── Vaults
```

## Паттерны API

### 1. RESTful API Routes

```
GET    /api/vaults              - List vaults
POST   /api/vaults              - Create vault
GET    /api/vaults/[id]         - Get vault
PUT    /api/vaults/[id]         - Update vault
DELETE /api/vaults/[id]         - Delete vault

GET    /api/vaults/[id]/notes   - List notes
POST   /api/vaults/[id]/notes   - Create note
GET    /api/notes/[id]          - Get note
PUT    /api/notes/[id]          - Update note
DELETE /api/notes/[id]          - Delete note

GET    /api/vaults/[id]/links   - List links
POST   /api/vaults/[id]/links   - Create link
DELETE /api/links/[id]          - Delete link
```

### 2. Error Handling

```
API Request
    ↓
Try-Catch Block
    ↓
If Error:
    ├── Log Error
    ├── Return Error Response
    └── Show User Notification
    ↓
If Success:
    ├── Return Data
    └── Update State
```

## Паттерны тестирования

### 1. Unit Tests

```
Function
    ↓
Test Input
    ↓
Test Output
    ↓
Test Edge Cases
```

### 2. Integration Tests

```
Component
    ↓
Mock API
    ↓
Test User Interaction
    ↓
Test State Updates
```

### 3. E2E Tests

```
User Flow
    ↓
Login
    ↓
Create Note
    ↓
Create Link
    ↓
View Graph
    ↓
Logout
```

## Паттерны развертывания

### 1. CI/CD Pipeline

```
Push to GitHub
    ↓
Run Tests
    ↓
Run Linting
    ↓
Build Project
    ↓
Deploy to Vercel
    ↓
Run E2E Tests
    ↓
Monitor Performance
```

### 2. Environment Management

```
Development
├── Local Supabase
├── Local Environment Variables
└── Hot Reload

Staging
├── Staging Supabase
├── Staging Environment Variables
└── Pre-production Testing

Production
├── Production Supabase
├── Production Environment Variables
└── Monitoring & Alerts
```

## Паттерны дизайна и темизации

### 1. Темы оформления

#### Цветовая палитра

**Основные цвета:**
- **Бежевый (Paper tone):** #d4b8a1 - основной цвет фона в светлой теме, имитирует старую бумагу
- **Синий (Accent):** #2e3ea6 - акцентный цвет для выделения важных элементов

#### Темы
- **Светлая тема:** #d4b8a1 (бумажный фон) с элементами темно-синего #2e3ea6
- **Темная тема:** тепловатый серый (темный, но не очень) с элементами светло-бежевого
- **Дополнительно:** в будущем планируется добавить дополнительные темы

#### Особенности темизации
- Для лучшего сочетания цветов в темной теме использовать тепловатый серый как основной фон
- В светлой теме использовать очень светлый бежевый (почти белый) как фон для элементов
- Избегать резкого изменения цвета фона для сохранения визуальной целостности
- Использовать shadcn/ui и Tailwind CSS для компонентов

### 2. Паттерны масштабируемости

#### 1. Database Scaling

```
Single Database
    ↓
Read Replicas
    ↓
Sharding by Vault ID
    ↓
Distributed Database
```

#### 2. API Scaling

```
Single Server
    ↓
Load Balancer
    ↓
Multiple Servers
    ↓
Auto-scaling
```

#### 3. Real-time Scaling

```
Single WebSocket Server
    ↓
Multiple WebSocket Servers
    ↓
Message Queue (Redis)
    ↓
Distributed Real-time
```

---

**Документ подготовлен:** 2026-03-14  
**Обновлен:** 2026-03-25 (фиксация библиотек: Cytoscape.js, Three.js, Zustand)
**Дополнено:** 2026-03-27 (добавлена информация о темизации и цветах)
