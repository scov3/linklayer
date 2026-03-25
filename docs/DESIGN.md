# Design Document
## LinkLayer - Техническое проектирование

**Версия:** 1.0  
**Дата создания:** 2026-03-25  
**Статус:** В разработке

---

## 1. Выбор библиотек

### 1.1 Graph Visualization

| Режим | Библиотека | Обоснование |
|-------|------------|-------------|
| Mode 1 (Классический) | **Cytoscape.js** | Специализирована для графов, есть layout algorithms, легковесная |
| Mode 2 (Физический) | **Three.js** + **d3-force** | d3-force для физики, Three.js для 3D рендеринга (опционально 3D режим) |

### 1.2 State Management

**Выбор: Zustand**

- Простота API (меньше boilerplate чем Redux)
- Отличная TypeScript поддержка
- Легковесный (~1KB)
- Встроенный middleware для devtools

### 1.3 Дополнительные библиотеки

| Категория | Библиотека | Версия |
|-----------|------------|--------|
| Markdown | react-markdown + remark-gfm | latest |
| Markdown Editor | @uiw/react-md-editor | latest |
| UI Components | Radix UI | latest |
| Icons | Lucide React | latest |
| HTTP | Native fetch | - |
| Form Validation | Zod | latest |
| Date | date-fns | latest |

---

## 2. Архитектура приложения

### 2.1 Структура директорий

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (app)/               # Protected app pages
│   │   ├── vault/[vaultId]/ # Vault pages
│   │   │   ├── page.tsx     # Vault main (graph view)
│   │   │   ├── notes/       # Notes list
│   │   │   ├── settings/    # Vault settings
│   │   │   └── chat/        # Chat view
│   │   └── layout.tsx       # App shell
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── vaults/
│   │   ├── notes/
│   │   ├── links/
│   │   ├── tags/
│   │   └── chat/
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing/redirect
├── components/
│   ├── ui/                  # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── auth/                # Auth components
│   │   ├── AuthForm.tsx
│   │   └── OAuthButton.tsx
│   ├── vault/              # Vault components
│   │   ├── VaultList.tsx
│   │   ├── VaultCard.tsx
│   │   └── VaultSettings.tsx
│   ├── notes/              # Notes components
│   │   ├── NoteEditor.tsx
│   │   ├── NoteList.tsx
│   │   ├── NoteCard.tsx
│   │   └── TagInput.tsx
│   ├── graph/              # Graph components
│   │   ├── GraphView.tsx
│   │   ├── ClassicalGraph.tsx    # Cytoscape.js
│   │   ├── PhysicsGraph.tsx      # Three.js + d3-force
│   │   ├── GraphControls.tsx
│   │   └── GraphFilters.tsx
│   └── chat/               # Chat components
│       ├── ChatPanel.tsx
│       ├── ChatMessage.tsx
│       └── NotePreview.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useVault.ts
│   ├── useNotes.ts
│   ├── useGraph.ts
│   └── useChat.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── types.ts         # Generated types
│   ├── api/
│   │   └── client.ts        # API client
│   └── utils/
│       ├── cn.ts            # classnames utility
│       └── markdown.ts      # Markdown helpers
├── store/
│   ├── authStore.ts
│   ├── vaultStore.ts
│   ├── notesStore.ts
│   ├── graphStore.ts
│   └── chatStore.ts
├── types/
│   ├── database.ts          # Supabase types
│   ├── api.ts               # API types
│   └── index.ts             # Re-exports
└── styles/
    └── globals.css
```

### 2.2 Компонентная иерархия

```
App
├── AuthLayout
│   ├── LoginPage
│   │   ├── OAuthButton (Google)
│   │   └── OAuthButton (GitHub)
│   └── RegisterPage
│
└── AppLayout (Protected)
    ├── Sidebar
    │   ├── VaultList
    │   │   └── VaultItem[]
    │   ├── CreateVaultButton
    │   └── UserMenu
    │
    └── MainContent
        ├── VaultPage
        │   ├── GraphView (switches between modes)
        │   │   ├── ClassicalGraph (Cytoscape.js)
        │   │   │   ├── GraphCanvas
        │   │   │   ├── GraphControls
        │   │   │   └── GraphFilters
        │   │   └── PhysicsGraph (Three.js + d3-force)
        │   │       ├── Scene3D
        │   │       ├── GraphNodes
        │   │       ├── GraphEdges
        │   │       └── GraphControls
        │   │
        │   ├── NotesPanel (collapsible)
        │   │   ├── NoteList
        │   │   │   └── NoteCard[]
        │   │   ├── NoteEditor
        │   │   │   ├── MarkdownEditor
        │   │   │   └── Preview
        │   │   └── TagInput
        │   │
        │   └── ChatPanel (collapsible)
        │       ├── ChatMessage[]
        │       ├── ChatInput
        │       └── NotePreview
        │
        └── SettingsPage
            ├── VaultSettings
            ├── MembersList
            └── DangerZone
```

---

## 3. Дизайн-система

### 3.1 Цветовая палитра (CSS Variables)

```css
:root {
  /* Light theme */
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #f8fafc;
  --card-foreground: #0f172a;
  --primary: #6366f1;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #475569;
  --muted: #f1f5f9;
  --muted-foreground: #94a3b8;
  --accent: #f1f5f9;
  --accent-foreground: #475569;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #6366f1;
  
  /* Graph colors */
  --graph-node: #6366f1;
  --graph-node-active: #818cf8;
  --graph-edge: #94a3b8;
  --graph-edge-active: #6366f1;
}

.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
  --card: #1e293b;
  --card-foreground: #f8fafc;
  --primary: #818cf8;
  --primary-foreground: #0f172a;
  --secondary: #1e293b;
  --secondary-foreground: #cbd5e1;
  --muted: #1e293b;
  --muted-foreground: #64748b;
  --accent: #1e293b;
  --accent-foreground: #cbd5e1;
  --destructive: #f87171;
  --destructive-foreground: #0f172a;
  --border: #334155;
  --input: #334155;
  --ring: #818cf8;
  
  /* Graph colors */
  --graph-node: #818cf8;
  --graph-node-active: #a5b4fc;
  --graph-edge: #475569;
  --graph-edge-active: #818cf8;
}
```

### 3.2 Типографика

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
}
```

### 3.3 Spacing & Sizing

```css
:root {
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 0.75rem;  /* 12px */
  --radius-xl: 1rem;     /* 16px */
  
  --sidebar-width: 280px;
  --header-height: 56px;
  --panel-min-width: 300px;
}
```

---

## 4. State Management (Zustand)

### 4.1 Auth Store

```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  signIn: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}
```

### 4.2 Vault Store

```typescript
interface VaultState {
  vaults: Vault[];
  currentVault: Vault | null;
  isLoading: boolean;
  
  // Actions
  fetchVaults: () => Promise<void>;
  createVault: (name: string) => Promise<Vault>;
  setCurrentVault: (vault: Vault) => void;
  updateVault: (id: string, data: Partial<Vault>) => Promise<void>;
  deleteVault: (id: string) => Promise<void>;
}
```

### 4.3 Notes Store

```typescript
interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isEditing: boolean;
  
  // Actions
  fetchNotes: (vaultId: string) => Promise<void>;
  createNote: (vaultId: string, title: string, content: string) => Promise<Note>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
}
```

### 4.4 Graph Store

```typescript
interface GraphState {
  mode: 'classical' | 'physics';
  selectedNodes: string[];
  filters: {
    tags: string[];
    search: string;
  };
  viewport: {
    zoom: number;
    pan: { x: number; y: number };
  };
  
  // Actions
  setMode: (mode: 'classical' | 'physics') => void;
  selectNode: (nodeId: string) => void;
  clearSelection: () => void;
  setFilters: (filters: Partial<GraphState['filters']>) => void;
  setViewport: (viewport: Partial<GraphState['viewport']>) => void;
}
```

---

## 5. API Design

### 5.1 REST Endpoints

#### Auth
```
GET    /api/auth/session      - Get current session
POST   /api/auth/signout      - Sign out
```

#### Vaults
```
GET    /api/vaults                     - List user's vaults
POST   /api/vaults                     - Create vault
GET    /api/vaults/:id                 - Get vault details
PUT    /api/vaults/:id                 - Update vault
DELETE /api/vaults/:id                 - Delete vault
GET    /api/vaults/:id/members         - List members
POST   /api/vaults/:id/members         - Add member
DELETE /api/vaults/:id/members/:userId - Remove member
```

#### Notes
```
GET    /api/vaults/:vaultId/notes      - List vault notes
POST   /api/vaults/:vaultId/notes      - Create note
GET    /api/notes/:id                  - Get note
PUT    /api/notes/:id                  - Update note
DELETE /api/notes/:id                  - Delete note
POST   /api/notes/:id/tags             - Update note tags
```

#### Links
```
GET    /api/vaults/:vaultId/links       - List vault links
POST   /api/vaults/:vaultId/links       - Create link
DELETE /api/links/:id                  - Delete link
```

#### Tags
```
GET    /api/vaults/:vaultId/tags        - List vault tags
POST   /api/vaults/:vaultId/tags        - Create tag
PUT    /api/tags/:id                    - Update tag
DELETE /api/tags/:id                   - Delete tag
```

#### Chat
```
GET    /api/vaults/:vaultId/chat        - Get chat messages
POST   /api/vaults/:vaultId/chat        - Send message
```

### 5.2 Request/Response Examples

#### Create Note
```typescript
// POST /api/vaults/:vaultId/notes
// Request
{
  title: "My Note",
  content: "# Hello\n\nThis is markdown content",
  tags: ["tag-id-1", "tag-id-2"]
}

// Response 201
{
  id: "uuid",
  vault_id: "uuid",
  title: "My Note",
  content: "# Hello\n\nThis is markdown content",
  tags: [
    { id: "tag-id-1", name: "tag1", color: "#6366f1" },
    { id: "tag-id-2", name: "tag2", color: "#10b981" }
  ],
  created_at: "2026-03-25T10:00:00Z",
  created_by: "user-uuid"
}
```

#### Create Link
```typescript
// POST /api/vaults/:vaultId/links
// Request
{
  source_note_id: "uuid-1",
  target_note_id: "uuid-2",
  link_type: "references" // optional
}

// Response 201
{
  id: "uuid",
  source_note_id: "uuid-1",
  target_note_id: "uuid-2",
  link_type: "references",
  created_at: "2026-03-25T10:00:00Z"
}
```

---

## 6. Graph Implementation

### 6.1 Classical Graph (Cytoscape.js)

```typescript
interface ClassicalGraphConfig {
  container: HTMLElement;
  elements: GraphElements;
  style: Cytoscape.Stylesheet[];
  layout: Cytoscape.LayoutOptions;
}

// Layout: cose-bilkent (force-directed, good for medium graphs)
// Alternative: dagre (hierarchical for large graphs)
```

**Особенности:**
- Используем `cose-bilkent` layout для авто-расположения
- Поддержка drag & drop для ручного расположения
- Клик по ноду открывает заметку
- Ctrl+click для множественного выбора
- Контекстное меню (правый клик) для создания связей

### 6.2 Physics Graph (Three.js + d3-force)

```typescript
interface PhysicsGraphConfig {
  nodes: PhysicsNode[];
  edges: PhysicsEdge[];
  config: {
    chargeStrength: number;      // отталкивание (-300)
    linkDistance: number;         // длина связи (100)
    collisionRadius: number;      // радиус столкновения (30)
    alphaDecay: number;          // затухание (0.02)
  };
}
```

**Особенности:**
- d3-force для физической симуляции
- Three.js для рендеринга (WebGL)
- Пиннинг нод (закрепление позиции)
- Плавные анимации
- 2D режим по умолчанию, 3D опционально

### 6.3 Graph Data Flow

```
┌─────────────┐
│  Notes DB   │
└──────┬──────┘
       │ fetch
       ▼
┌─────────────┐
│  NotesStore │ ◄── Zustand
└──────┬──────┘
       │ transform
       ▼
┌─────────────┐
│ GraphStore  │ ◄── filters, selection
└──────┬──────┘
       │ elements
       ▼
┌─────────────┐
│  GraphView  │ ◄── Cytoscape.js / Three.js
└─────────────┘
```

---

## 7. Real-time Sync (Supabase Realtime)

### 7.1 Channels

```typescript
// Vault channel - for vault-wide updates
supabase.channel(`vault:${vaultId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'notes',
    filter: `vault_id=eq.${vaultId}`
  }, handleNoteChange)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'links',
    filter: `vault_id=eq.${vaultId}`
  }, handleLinkChange)
  .on('broadcast', { event: 'chat' }, handleChatMessage)
  .subscribe();
```

### 7.2 Sync Strategy

1. **Optimistic Updates**: UI обновляется сразу, потом синхронизация
2. **Conflict Resolution**: Last-write-wins для MVP, CRDT в будущем
3. **Presence**: Показываем кто онлайн в хранилище

---

## 8. Component Specifications

### 8.1 NoteEditor

**Props:**
```typescript
interface NoteEditorProps {
  note: Note;
  onSave: (content: string) => void;
  onCancel: () => void;
}
```

**Features:**
- Split view: Editor | Preview
- Toolbar: Bold, Italic, Headers, List, Code, Link
- Auto-save (debounced 1s)
- Tag management inline
- Link insertion modal

### 8.2 GraphView

**Props:**
```typescript
interface GraphViewProps {
  vaultId: string;
  mode: 'classical' | 'physics';
  onNodeClick: (noteId: string) => void;
  onNodeDoubleClick: (noteId: string) => void;
}
```

**Features:**
- Mode switcher (toggle)
- Zoom controls (+/- buttons, scroll)
- Pan (drag on canvas)
- Node selection
- Filter panel (tags, search)
- Mini-map (optional for large graphs)

### 8.3 ChatPanel

**Props:**
```typescript
interface ChatPanelProps {
  vaultId: string;
  onAttachNote: (noteId: string) => void;
}
```

**Features:**
- Real-time messages
- Note attachment with preview
- Click attachment to open note
- Timestamp display
- Auto-scroll to new messages

---

## 9. Performance Optimizations

### 9.1 Graph

| Optimization | Implementation |
|--------------|----------------|
| Virtualization | Render only visible nodes (viewport culling) |
| Level of Detail | Hide labels when zoomed out |
| Debouncing | Debounce layout recalculations |
| Web Workers | Run physics simulation in worker |
| Batch Updates | Batch DOM updates |

### 9.2 Data Fetching

| Strategy | Implementation |
|----------|----------------|
| Lazy Loading | Load notes on vault open, not all vaults |
| Pagination | Paginate note lists (20 per page) |
| Caching | React Query / SWR for API responses |
| Prefetching | Prefetch adjacent notes |

### 9.3 Bundle Size

- Dynamic imports for graph libraries (loaded on demand)
- Tree-shaking enabled
- No unused dependencies

---

## 10. Error Handling

### 10.1 Error Boundaries

```typescript
// Per-feature error boundaries
<ErrorBoundary fallback={<GraphError />}>
  <GraphView />
</ErrorBoundary>

<ErrorBoundary fallback={<NotesError />}>
  <NotesPanel />
</ErrorBoundary>
```

### 10.2 API Error Responses

```typescript
// Standard error format
{
  error: {
    code: "NOTE_NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION_ERROR",
    message: "Human readable message",
    details?: Record<string, string[]>
  }
}
```

### 10.3 User Feedback

- Toast notifications for errors
- Inline validation messages
- Retry buttons for failed operations
- Offline indicator

---

## 11. Security

### 11.1 Row Level Security (Supabase)

```sql
-- Notes: Only vault members can read/write
CREATE POLICY "Vault members can read notes" ON notes
  FOR SELECT USING (
    vault_id IN (
      SELECT vault_id FROM vault_members WHERE user_id = auth.uid()
    )
  );

-- Chat: Only vault members can read/write
CREATE POLICY "Vault members can read chat" ON chat_messages
  FOR ALL USING (
    vault_id IN (
      SELECT vault_id FROM vault_members WHERE user_id = auth.uid()
    )
  );
```

### 11.2 Input Validation

- Zod schemas for all API inputs
- Server-side validation
- XSS prevention (React handles escaping)
- CSRF protection via SameSite cookies

---

## 12. File Structure (src/)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── vault/[vaultId]/
│   │   │   ├── page.tsx
│   │   │   ├── notes/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── chat/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/[...supabase]/route.ts
│   │   ├── vaults/route.ts
│   │   ├── vaults/[vaultId]/route.ts
│   │   ├── vaults/[vaultId]/notes/route.ts
│   │   ├── vaults/[vaultId]/links/route.ts
│   │   ├── vaults/[vaultId]/tags/route.ts
│   │   ├── vaults/[vaultId]/chat/route.ts
│   │   ├── vaults/[vaultId]/members/route.ts
│   │   ├── notes/[noteId]/route.ts
│   │   ├── notes/[noteId]/tags/route.ts
│   │   ├── links/[linkId]/route.ts
│   │   └── tags/[tagId]/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── auth-form.tsx
│   │   └── oauth-button.tsx
│   ├── vault/
│   │   ├── vault-list.tsx
│   │   ├── vault-card.tsx
│   │   └── vault-settings.tsx
│   ├── notes/
│   │   ├── note-editor.tsx
│   │   ├── note-list.tsx
│   │   ├── note-card.tsx
│   │   └── tag-input.tsx
│   ├── graph/
│   │   ├── graph-view.tsx
│   │   ├── classical-graph.tsx
│   │   ├── physics-graph.tsx
│   │   ├── graph-controls.tsx
│   │   └── graph-filters.tsx
│   ├── chat/
│   │   ├── chat-panel.tsx
│   │   ├── chat-message.tsx
│   │   └── note-preview.tsx
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── app-shell.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-vault.ts
│   ├── use-notes.ts
│   ├── use-links.ts
│   ├── use-tags.ts
│   ├── use-chat.ts
│   └── use-realtime.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── api/
│   │   └── client.ts
│   └── utils/
│       ├── cn.ts
│       └── markdown.ts
├── store/
│   ├── auth-store.ts
│   ├── vault-store.ts
│   ├── notes-store.ts
│   ├── graph-store.ts
│   └── chat-store.ts
├── types/
│   ├── database.ts
│   ├── api.ts
│   └── index.ts
└── styles/
    └── globals.css
```

---

**Документ подготовлен:** 2026-03-25  
**Следующий этап:** Настройка окружения (DLV-003)
