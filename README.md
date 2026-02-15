# ResearchFlow

An AI-powered research assistant that combines real-time web search, intelligent summarization, and knowledge management into a seamless, production-grade research platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.0-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://react.dev)

## Overview

ResearchFlow is not a ChatGPT wrapper—it's a complete research platform designed for professionals, researchers, and knowledge workers who want to explore topics systematically. It combines real-time web search, GPT-powered summaries and follow-up questions, persistent knowledge management, and analytics into one cohesive workflow.

### Key Differentiators

- **4-stage research workflow**: Search → Summarize → Explore → Capture
- **Production-grade architecture**: TypeScript strict mode, zero ESLint warnings, 6-8s builds
- **Workspace isolation**: Separate projects with independent history, notes, and analytics
- **Knowledge Base**: Markdown editor with Supabase backend for permanent, searchable notes
- **Global analytics**: Track research patterns across all workspaces or drill into specific projects
- **Power-user tools**: Command Palette (Cmd+K), 15+ keyboard shortcuts, dark mode
- **Cost-optimized AI**: Smart token limits and temperature tuning
- **Open source**: MIT licensed, self-hostable, no vendor lock-in

## Features

### 🔍 Search & Summarization
- Real-time web search via Serper API (actual results, not training data)
- GPT-powered 150-200 word summaries with 3-5 key takeaways
- Configurable AI temperature and token limits for cost control

### ❓ Intelligent Questions
- AI generates 5-7 contextual follow-up questions for deeper exploration
- Click any question to trigger a new search (recursive exploration)
- Temperature 0.8 for creative, diverse suggestions

### 📚 Knowledge Base (Second Brain)
- Save searches as permanent notes with full context preservation
- Markdown editor with live preview
- Full-text search across all notes
- Tag system with autocomplete and filtering
- Workspace-isolated note libraries

### 💼 Multi-Workspace System
- Create multiple isolated workspaces (Personal, Work, Research, etc.)
- Each workspace has independent search history, notes, and analytics
- Emoji icons and color coding for quick visual identification
- Workspace switcher with keyboard shortcuts (Cmd+1 through Cmd+9)

### 📊 Analytics Dashboard
- Global view: Aggregated metrics across all workspaces
- Per-workspace view: Drill into specific project metrics
- Visualizations: Daily trends (Recharts), hourly activity heatmap, top queries
- Metrics tracked: searches, summaries, questions, notes saved, exports
- Time range filtering: Last 7, 30, or 90 days

### 💾 Export & Sharing
- **Export formats**: Markdown (for Notion/Obsidian), CSV, HTML/PDF
- **URL sharing**: Deep links with encoded search state for collaboration
- **Granular options**: Include/exclude timestamps, select specific notes

### ⌨️ Keyboard Shortcuts
- `Cmd+K`: Command Palette (fuzzy search all commands)
- `Cmd+N`: New search
- `Cmd+H`: Toggle search history
- `Cmd+B`: Open Knowledge Base
- `Cmd+Shift+N`: Create new workspace
- `Cmd+1` through `Cmd+9`: Switch workspaces
- `Cmd+/`: Show keyboard shortcuts
- Arrow keys, Tab, Enter for full keyboard navigation

### 🎨 UI & Accessibility
- Full dark mode support with WCAG AA contrast compliance
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions (300ms default)
- Semantic HTML and ARIA labels for screen readers
- Keyboard-navigable Command Palette and all menus

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18 with hooks
- **Language**: TypeScript 5.6 (strict mode)
- **Styling**: Tailwind CSS 3.4 + custom fonts (Crimson Pro, DM Sans)
- **State**: Zustand 5.0 with localStorage persistence
- **Charts**: Recharts (responsive, accessible)
- **Components**: 25+ reusable functional components

### Backend
- **Runtime**: Next.js serverless API routes
- **Language**: TypeScript
- **External APIs**:
  - Serper API (real-time web search)
  - OpenAI API (GPT-4 summaries, questions)
  - Supabase (PostgreSQL database)

### Database
- **Service**: Supabase (PostgreSQL)
- **Tables**: `knowledge_notes`, `note_tags`, analytics logging tables
- **Features**: Full-text search indexes, RLS policies, vector support (future)

### DevOps & Quality
- **Deployment**: Vercel (auto-deploy from main branch)
- **Code Quality**: ESLint (zero warnings), Prettier, TypeScript strict mode
- **Security**: CodeQL scanning, Dependabot, branch protection
- **Monitoring**: Error tracking, analytics logging

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- API keys:
  - OpenAI API key (https://platform.openai.com/api-keys)
  - Serper API key (https://serper.dev/)
  - Supabase URL & keys (optional, for Knowledge Base)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/spattnaik1998/claude-autobuild-voicesearch.git
   cd claude-autobuild-voicesearch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```env
   OPENAI_API_KEY=sk-proj-...
   SERPER_API_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo, gpt-4-turbo
   ```

4. **Start development server**
   ```bash
   npm run dev -- -p 3005
   ```

   **Note**: Port 3005 is required per project guidelines to avoid conflicts with other services.

   Open [http://localhost:3005](http://localhost:3005) in your browser.

5. **(Optional) Set up Knowledge Base**

   The Knowledge Base requires Supabase. See [KNOWLEDGE_BASE_SETUP.md](KNOWLEDGE_BASE_SETUP.md) for detailed instructions on creating the database schema.

## Project Structure

```
.
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main search interface
│   ├── layout.tsx                # Root layout with metadata
│   ├── dashboard/                # Analytics dashboard
│   ├── api/                       # Serverless API routes
│   │   ├── search/               # Serper API integration
│   │   ├── summarize/            # OpenAI summarization
│   │   ├── questions/            # Generate follow-up questions
│   │   ├── analytics/            # Dashboard data aggregation
│   │   └── knowledge/            # Knowledge Base CRUD
│   └── globals.css               # Global styles & Tailwind
│
├── components/                    # React components (25+)
│   ├── SearchInput.tsx           # Query input with suggestions
│   ├── SearchResults.tsx         # Result cards with actions
│   ├── SummaryCard.tsx           # AI summary display
│   ├── RelatedQuestions.tsx      # Follow-up question cards
│   ├── SearchHistory.tsx         # Timeline sidebar
│   ├── CommandPalette.tsx        # Cmd+K fuzzy search
│   ├── WorkspaceSwitcher.tsx     # Workspace management UI
│   ├── NotificationCenter.tsx    # Toast stack
│   ├── knowledge/                # Knowledge Base components
│   │   ├── KnowledgeBase.tsx     # Main modal
│   │   ├── KnowledgeEditor.tsx   # Markdown editor
│   │   └── KnowledgeLibrary.tsx  # Note grid view
│   ├── dashboard/                # Analytics components
│   │   ├── StatsCards.tsx        # Metric display
│   │   ├── SearchTrend.tsx       # Daily trends chart
│   │   ├── ActivityHeatmap.tsx   # Hourly activity
│   │   └── TopQueries.tsx        # Popular searches
│   └── ui/                       # Design system (Button, Card, etc.)
│
├── stores/                        # Zustand state management
│   ├── workspaceStore.ts         # Workspace + history state
│   ├── commandStore.ts           # Command Palette state
│   └── notificationStore.ts      # Toast notifications
│
├── lib/                          # Utilities & hooks
│   ├── openai.ts                 # OpenAI API integration
│   ├── serper.ts                 # Serper web search
│   ├── knowledge-db.ts           # Supabase operations
│   ├── storage-optimized.ts      # localStorage utilities
│   ├── url-state.ts              # URL state encoding/decoding
│   └── hooks.ts                  # Custom React hooks
│
├── types/                        # TypeScript interfaces
│   └── index.ts                  # All type definitions
│
├── public/                       # Static assets
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json                 # TypeScript strict mode
├── next.config.ts                # Next.js configuration
└── tailwind.config.js            # Tailwind customization
```

## API Routes

### Search Endpoints

**POST `/api/search`**
- Real-time web search via Serper API
- Request: `{ query: string }`
- Response: `{ results: SearchResult[] }`

**POST `/api/summarize`**
- Generate AI summary from search results
- Request: `{ results: SearchResult[] }`
- Response: `{ summary: string, keyPoints: string[] }`

**POST `/api/questions`**
- Generate follow-up questions
- Request: `{ query: string, summary: string }`
- Response: `{ questions: string[] }`

### Analytics Endpoints

**GET `/api/analytics/dashboard?workspace=all&days=7`**
- Get dashboard metrics and charts
- Query params: `workspace` (all|workspace-id), `days` (7|30|90)
- Response: Daily trends, stats, hourly heatmap, top queries

**POST `/api/analytics/log`**
- Log research events (search, summarize, question, note, export)
- Request: `{ workspaceId, eventType, metadata }`

### Knowledge Base Endpoints

**GET `/api/knowledge/notes?workspace=...&tag=...&search=...`**
- List notes with filtering
- Query params: `workspace`, `tag`, `search` (full-text)

**POST `/api/knowledge/notes`**
- Create new note
- Request: `{ title, content, tags, workspaceId }`

**PATCH `/api/knowledge/notes/:id`**
- Update note
- Request: `{ title, content, tags }`

**DELETE `/api/knowledge/notes/:id`**
- Delete note

## Development

### Code Quality Commands

```bash
# TypeScript strict mode checking
npx tsc --noEmit

# ESLint (with auto-fix)
npm run lint
npm run lint -- --fix

# Prettier formatting
npm run format

# Production build
npm run build

# Build size analysis
npm run build -- --analyze
```

### Testing Checklist

Before committing, verify:

- [ ] TypeScript: `npx tsc --noEmit` (no errors)
- [ ] ESLint: `npm run lint` (no warnings)
- [ ] Build: `npm run build` (succeeds in <10s)
- [ ] Dev server: `npm run dev -- -p 3005` (starts cleanly)
- [ ] Manual testing:
  - [ ] Search executes with Serper API
  - [ ] AI summary generates in <5s
  - [ ] Questions appear with animations
  - [ ] Clicking question triggers new search
  - [ ] Knowledge Base save works
  - [ ] Workspace switching resets state
  - [ ] Analytics dashboard loads
  - [ ] Dark mode toggles smoothly
  - [ ] No console errors in DevTools

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on main branch push

### Self-Hosting

```bash
# Build for production
npm run build

# Start production server
npm start
```

Environment variables needed:
- `OPENAI_API_KEY`: OpenAI API key
- `SERPER_API_KEY`: Serper API key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_APP_URL`: Your deployment URL

## Documentation

- **[CLAUDE.md](CLAUDE.md)**: Development guidelines and architecture
- **[KNOWLEDGE_BASE_SETUP.md](KNOWLEDGE_BASE_SETUP.md)**: Database schema and Supabase setup
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Contribution guidelines
- **[LAUNCH.md](LAUNCH.md)**: Deployment and launch checklist
- **[SECURITY.md](SECURITY.md)**: Security practices and policies

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Code style and standards
- Commit message format
- Pull request process
- Feature requests and bug reports

## License

MIT License - See [LICENSE](LICENSE) for details.

You are free to use, modify, and distribute this software for commercial or personal projects.

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org) for the full-stack framework
- [React](https://react.dev) for UI components
- [OpenAI](https://openai.com) for GPT summaries and questions
- [Serper](https://serper.dev) for real-time web search
- [Supabase](https://supabase.com) for PostgreSQL and authentication
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Zustand](https://github.com/pmndrs/zustand) for state management
- [Recharts](https://recharts.org) for data visualization

---

**Built with TypeScript strict mode, ESLint zero-warnings, and production-grade engineering practices.**

*For questions or feedback, open an [issue](https://github.com/spattnaik1998/claude-autobuild-voicesearch/issues) on GitHub.*
