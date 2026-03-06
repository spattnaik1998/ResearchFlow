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

### Route Groups (Next.js App Router)

```
app/
├── (public)/page.tsx           — Landing page (unauthenticated)
├── (auth)/auth/                — Login, signup, forgot/reset password, callback
│   └── callback/route.ts       — Handles BOTH PKCE (code=) and token-hash (token_hash=&type=) auth flows
├── (protected)/
│   ├── RootLayoutClient.tsx    — User-switch detection; clears localStorage/workspaces on login change
│   └── app/
│       ├── page.tsx            — Main 4-stage workflow (Search → Results → Summary → Questions)
│       ├── dashboard/          — Analytics dashboard
│       ├── knowledge/          — Knowledge base (notes CRUD)
│       ├── settings/
│       └── profile/
└── api/                        — All routes require auth (401 if no session)
    ├── search/, summarize/, questions/
    ├── export/{markdown,csv,pdf}/
    └── analytics/{log,dashboard}/
```

### Two Supabase Clients — Do Not Mix Them

| File | Usage |
|------|-------|
| `lib/supabase.ts` → `createSupabaseClient()` / `supabase` | Client components only (browser) |
| `lib/auth-helpers.ts` → `getUser()` | Server components, API routes (`'use server'`) |
| `lib/supabase-server.ts` | Server-side Supabase client for API routes |

All API routes protect themselves with `const user = await getUser()` and return 401 if null.

### Analytics: Always Use the Server API Route

**Never** write analytics events directly from client-side Supabase. Always `fetch('/api/analytics/log', ...)`. Direct inserts silently fail RLS and produce no `user_id`, showing 0 in the dashboard. See `lib/hooks/useAnalytics.ts` for the pattern.

### Workspace & Storage Multi-User Isolation

- Workspace IDs are unique: `ws_${Date.now()}_${random}` — never hardcode `'default'`
- localStorage history keys are namespaced: `voicesearch_history_<first-8-chars-of-userId>_<workspaceId>`
- On user switch (detected in `app/(protected)/RootLayoutClient.tsx`), all prior-user localStorage is cleared via `clearAllHistoryKeysForUser()` and `clearForNewUser()` before the new user's state loads
- `workspaceStore.ts` uses Zustand `persist` — call `clearForNewUser()` before populating state for a new user

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

All migrations live in `supabase/migrations/` and must be run **manually** in the Supabase Dashboard SQL Editor — there is no CLI migration runner configured. Run them in numeric order (001 → 007). Migration 007 is required for multi-user isolation.

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
