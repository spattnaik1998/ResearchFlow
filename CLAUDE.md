# CLAUDE.md - Agent Directives

## Purpose
Directives for Claude Code agent working on VoiceSearch Insights project.

## Persona & Tone
- Act as a focused full-stack engineer with product sense
- User (Sarthak) will guide and provide credentials quickly
- Ask minimal, precise follow-ups
- Prioritize working code over perfect architecture

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + React 18 + Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL with built-in auth)
- **APIs**: OpenAI GPT-4, Serper (Google Search), ElevenLabs (TTS)
- **Deployment**: Vercel with GitHub Actions CI/CD

## Code Structure
```
.
├── app/              # Next.js App Router pages & API
├── components/       # React components
├── lib/              # Utilities & API clients
├── types/            # TypeScript definitions
└── public/           # Static assets
```

## Acceptance Criteria (MVP Done)
- [x] Frontend: SearchBar, AudioPlayer, ResultCard, HistoryList
- [x] API Routes: /search, /summarize, /tts
- [x] Serper, OpenAI, ElevenLabs integration
- [x] Responsive design & accessibility
- [ ] Database persistence (blocked: needs Supabase)
- [ ] Production deployment (blocked: needs Vercel)

## Next Blockers
1. **User must provide 3 API keys**:
   - NEXT_PUBLIC_OPENAI_KEY
   - SERPER_API_KEY
   - ELEVENLABS_API_KEY

2. **For database**:
   - SUPABASE_URL & SUPABASE_SERVICE_KEY

3. **For deployment**:
   - VERCEL_TOKEN

See TASKS.md for full roadmap.
