# ResearchFlow Development Guidelines

This file documents development standards and practices for the ResearchFlow project.

## Port Configuration

**CRITICAL**: The development server must use **port 3005**, NOT port 3000.

- **Reason**: Port 3000 commonly conflicts with other services and local tools
- **Command**: Run `npm run dev -- -p 3005`
- **Setup**: If Next.js defaults to 3000, configure in `next.config.ts` or use the `-p` flag above

When testing, always open: **http://localhost:3005**

## TypeScript & Code Quality

### Strict Mode
- All code must pass TypeScript strict mode without errors
- Command: `npx tsc --noEmit`
- No `@ts-ignore` or `// @ts-expect-error` comments without documentation

### ESLint
- All code must pass ESLint before commits
- Command: `npm run lint`
- No warnings or errors
- Run `npm run lint -- --fix` to auto-fix issues when possible

### Building
- Production build must succeed
- Command: `npm run build`
- All warnings must be addressed before deployment

## Development Workflow

### Before Starting Work
1. Verify no processes are using port 3005: `lsof -i :3005` (or equivalent for Windows)
2. Install dependencies: `npm install`
3. Configure `.env.local` with required API keys
4. Start dev server: `npm run dev -- -p 3005`

### During Development
1. Make focused, atomic changes
2. Keep components and functions small
3. Use TypeScript types for all function parameters and returns
4. Write self-documenting code (minimize comments unless logic isn't obvious)
5. Test locally before committing

### Before Committing
1. Run tests: `npm run test` (if configured)
2. Check types: `npx tsc --noEmit`
3. Run linter: `npm run lint`
4. Build for production: `npm run build`
5. Write clear commit messages following Conventional Commits

## Key Project Files & Architecture

### Core Application
- **Main Page**: `/app/page.tsx` - 4-stage workflow (Search → Results → Summary → Questions)
- **Layout**: `/app/layout.tsx` - Metadata and root layout
- **Global Styles**: `/app/globals.css` - Tailwind + custom CSS

### API Routes (Next.js)
```
/app/api/
├── search/route.ts       - Serper API integration
├── summarize/route.ts    - OpenAI summarization
└── questions/route.ts    - AI-powered related questions
```

### State Management
- **Location**: `/stores/`
- **Tool**: Zustand
- **Key Stores**:
  - `workspaceStore.ts` - Workspace management, search history
  - `commandStore.ts` - Command palette state
  - `notificationStore.ts` - Toast notifications

### Components
- **Location**: `/components/`
- **Approach**: Functional components with React hooks
- **Key Components**:
  - `SearchInput.tsx` - Query input
  - `SearchResults.tsx` - Search result cards
  - `SummaryCard.tsx` - AI summary display
  - `RelatedQuestions.tsx` - Follow-up questions
  - `SearchHistory.tsx` - Persistent search history sidebar
  - `NotificationCenter.tsx` - Toast/activity notifications
  - `WorkspaceSwitcher.tsx` - Multi-workspace support
  - `knowledge/` - Knowledge Base components

### Type Definitions
- **Location**: `/types/index.ts`
- All API interfaces defined here
- Used for request/response typing

### Utilities & Hooks
- **API Utilities**: `/lib/` directory
  - `openai.ts` - OpenAI integration
  - `serper.ts` - Serper search integration
  - `knowledge-db.ts` - Supabase database operations
  - `storage-optimized.ts` - Optimized localStorage
  - `url-state.ts` - URL state management for sharing
  - `hooks.ts` - Custom React hooks

### Database
- **Service**: Supabase (PostgreSQL)
- **Setup**: See `KNOWLEDGE_BASE_SETUP.md`
- **Tables**:
  - `knowledge_notes` - Saved research notes
  - `note_tags` - Tag categorization
  - `note_links` - Bidirectional linking (future)
  - `collections` - Note organization (future)

## Features Overview

### Search & Summarization
- Real-time web search via Serper API
- AI-powered summaries via OpenAI GPT-3.5/4
- 4-stage workflow with progress indicators

### AI-Powered Questions
- Generates 5-7 related follow-up questions
- Click any question to search again (recursive exploration)
- Animations and loading states

### Knowledge Base
- Save searches as permanent notes
- Markdown editor with live preview
- Full-text search and tag filtering
- Workspace isolation

### Workspace System
- Multi-project isolation
- Favorites and archive
- Separate search history per workspace
- Create/delete workspaces

### Additional Features
- Command Palette (Cmd+K) with fuzzy search
- Persistent search history with timeline
- Dark mode with smooth transitions
- URL sharing with deep links
- Toast notifications and activity feed
- Keyboard shortcuts (Cmd+N, Cmd+H, Cmd+/, etc.)

## Environment Variables

Required for local development:

```env
# Search & Summarization
OPENAI_API_KEY=sk-proj-...                    # From https://platform.openai.com/api-keys
SERPER_API_KEY=...                             # From https://serper.dev/

# Knowledge Base (Optional)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_KEY=...

# Optional
OPENAI_MODEL=gpt-3.5-turbo                     # Or gpt-4, gpt-4-turbo, etc.
NEXT_PUBLIC_APP_URL=http://localhost:3005
```

Copy `.env.example` and fill in your keys:
```bash
cp .env.example .env.local
```

## Common Commands

```bash
# Development
npm run dev -- -p 3005          # Start dev server (port 3005)

# Code Quality
npm run lint                     # Run ESLint
npx tsc --noEmit               # Check TypeScript
npm run format                  # Format with Prettier

# Building & Testing
npm run build                   # Production build
npm run start                   # Run production build
npm run test                    # Run tests (if configured)
```

## Design & Aesthetics

- **Typography**: Crimson Pro (headings) + DM Sans (body)
- **Color Scheme**: Deep teal (#0f4c5c) + warm amber (#fb8500)
- **Dark Mode**: Full support with persistent user preference
- **Animations**: 300ms transitions, staggered reveals
- **Accessibility**: WCAG AA compliant, full keyboard navigation

## Testing Checklist Before Commits

- [ ] TypeScript: `npx tsc --noEmit` (no errors)
- [ ] ESLint: `npm run lint` (no warnings/errors)
- [ ] Build: `npm run build` (succeeds)
- [ ] Dev Server: `npm run dev -- -p 3005` (starts on port 3005)
- [ ] Manual Testing: Core workflow tested locally
  - [ ] Search executes
  - [ ] Results display
  - [ ] Summary generates
  - [ ] Questions appear
  - [ ] Question click triggers new search
- [ ] No console errors in browser DevTools

## Git Workflow

- Use feature branches: `feature/description`
- Commit messages: Conventional Commits format
- Keep commits focused and atomic
- Write clear, descriptive commit messages
- Do not force-push unless explicitly authorized

## Deployment

- Main branch is auto-deployed to Vercel
- All tests must pass before merge
- Security scanning required (CodeQL, Dependabot)
- Branch protection rules in place

## Questions or Clarifications?

Refer to specific documentation files:
- **Feature Setup**: `KNOWLEDGE_BASE_SETUP.md`
- **Deployment**: `LAUNCH.md`
- **Contributing**: `CONTRIBUTING.md`
- **Security**: `SECURITY.md`

---

**Last Updated**: February 2026
