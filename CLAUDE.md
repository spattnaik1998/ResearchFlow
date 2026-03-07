# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev -- -p 3005    # Dev server — MUST use port 3005, not 3000
npm run build             # Production build
npm run lint              # ESLint (must pass before commits)
npx tsc --noEmit          # TypeScript strict check
npm run format            # Prettier
npm run test              # Jest (no test files currently exist)
```

Always open the app at **http://localhost:3005**.

## Architecture

This is **ResearchFlow** — a Next.js 15 App Router app (React 18, TypeScript, Tailwind) backed by Supabase (auth + DB) + OpenAI (summaries/questions) + Serper (web search).

### Route Groups

```
app/
├── layout.tsx                      — Root layout; mounts app/RootLayoutClient.tsx
├── RootLayoutClient.tsx            — Auth init, user-switch detection, cloud data load, migration
├── (public)/page.tsx               — Landing page (unauthenticated)
├── (auth)/auth/                    — Login, signup, forgot/reset password, callback
│   └── callback/route.ts           — Handles BOTH PKCE (code=) and token-hash (token_hash=&type=) flows
├── (protected)/
│   ├── RootLayoutClient.tsx        — Keyboard shortcuts, CommandPalette, ToastStack (simpler wrapper)
│   └── app/
│       ├── page.tsx                — Main 4-stage workflow: Search → Results → Summary → Questions
│       ├── dashboard/              — Analytics dashboard (Recharts)
│       ├── knowledge/              — Knowledge base (notes CRUD)
│       ├── settings/
│       └── profile/
└── api/                            — All routes require auth (401 if no session)
    ├── search/, summarize/, questions/
    ├── export/{markdown,csv,pdf}/
    └── analytics/{log,dashboard}/
```

**Two RootLayoutClient files with distinct roles:**
- `app/RootLayoutClient.tsx` — Handles auth state changes, user-switch detection (clears prior user's localStorage/workspaces), initial migration to cloud, and loading cloud workspaces on login. This is the critical multi-user isolation point.
- `app/(protected)/RootLayoutClient.tsx` — Simpler: counts history entries, sets up global keyboard shortcuts, renders `<CommandPalette>` and `<ToastStack>`.

### Three Supabase Clients — Do Not Mix Them

| File | Export | Usage |
|------|--------|-------|
| `lib/supabase.ts` | `createSupabaseClient()` / `supabase` | Client components only (browser) |
| `lib/auth-helpers.ts` | `getUser()` | Auth check in API routes / server components (`'use server'`) |
| `lib/supabase-server.ts` | `createSupabaseServerClient()` | Full Supabase ops in API routes (`'use server'`) |

All API routes protect themselves with `const user = await getUser()` and return 401 if null.

### Analytics: Always Use the Server API Route

**Never** write analytics events directly from client-side Supabase. Always `fetch('/api/analytics/log', ...)`. Direct inserts silently fail RLS and produce no `user_id`, showing 0 in the dashboard. See `lib/hooks/useAnalytics.ts` for the pattern.

### Search History: Dual-Storage Strategy

Search history is stored in two places simultaneously:

- **localStorage** (fast, namespaced per user+workspace): `lib/storage.ts` — key format `voicesearch_history_<first-8-userId>_<workspaceId>`
- **Supabase** (`search_history` table): `lib/history-db.ts` — cloud persistence, authoritative on login

On login, `lib/migration.ts → loadCloudDataOnLogin()` fetches cloud history and merges it into localStorage. Local writes (`lib/storage-optimized.ts`) are debounced and also fire a Supabase upsert via `lib/history-db.ts → saveHistoryEntry()`.

### Workspace & Storage Multi-User Isolation

- Workspace IDs are unique: `ws_${Date.now()}_${random}` — never hardcode `'default'`
- On user switch (detected in `app/RootLayoutClient.tsx`), prior user's localStorage is cleared via `clearAllHistoryKeysForUser()` and `clearForNewUser()` before the new user's state loads
- `workspaceStore.ts` uses Zustand `persist` — call `clearForNewUser()` before populating state for a new user; use `setWorkspacesFromCloud()` (replace, not merge) on login so stale local workspaces never persist

### Key Libraries

| Purpose | Library |
|---------|---------|
| State management | Zustand (`stores/`) — `workspaceStore`, `authStore`, `commandStore`, `notificationStore`, `settingsStore` |
| Fuzzy search (command palette) | Fuse.js |
| Charts (dashboard) | Recharts |
| Markdown rendering | react-markdown + remark-gfm |
| Input validation | Zod (`lib/validation.ts`) |
| Search API | Serper (`lib/serper.ts`) |
| AI summaries/questions | OpenAI (`lib/openai.ts`) |

### Database Migrations

All migrations live in `supabase/migrations/` and must be run **manually** in the Supabase Dashboard SQL Editor — there is no CLI migration runner configured. Run them in numeric order (001 → 008).

**Migration 008** (`008_auto_create_workspace_on_signup.sql`) installs a Postgres trigger (`on_auth_user_created`) that auto-creates a "Personal" workspace for every new user at the DB level. This eliminates the client-side race condition where `migrateUserData()` ran before workspaces were ready.

### Environment Variables

```env
OPENAI_API_KEY=
SERPER_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=          # Server-side only
OPENAI_MODEL=gpt-3.5-turbo     # Optional; defaults to gpt-3.5-turbo
NEXT_PUBLIC_APP_URL=http://localhost:3005
```
