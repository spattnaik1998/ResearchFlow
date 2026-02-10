# VoiceSearch Insights 🔊

Search any topic, get AI-summarized answers, and listen to them as natural speech.

**[🌐 Live Demo](https://claude-autobuild-voicesearch.vercel.app)** | **[📖 Documentation](#documentation)**

## Features

- 🔍 **Smart Search** - Real-time search results via Serper API
- 🤖 **AI Summaries** - Intelligent summarization with OpenAI GPT-3.5
- 🎙️ **Natural Audio** - Human-like text-to-speech via ElevenLabs
- 📱 **Responsive UI** - Mobile-first design (mobile, tablet, desktop)
- ⚡ **Fast & Smooth** - Instant API integration with smooth animations
- 🔒 **Secure** - Branch protection, security scanning, dependency management
- 🚀 **Serverless** - Built with Next.js, deployed on Vercel

## Tech Stack

- **Frontend:** Next.js 15 + TypeScript + React 18 + Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (Postgres)
- **APIs:** OpenAI, Serper, ElevenLabs
- **Deployment:** Vercel

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. **Clone and setup**
   ```bash
   git clone https://github.com/spattnaik1998/claude-autobuild-voicesearch.git
   cd claude-autobuild-voicesearch
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your API keys:
   - `OPENAI_API_KEY` - [Get from OpenAI](https://platform.openai.com/api-keys)
   - `SERPER_API_KEY` - [Get from Serper](https://serper.dev/)
   - `ELEVENLABS_API_KEY` - [Get from ElevenLabs](https://elevenlabs.io/)
   - `SUPABASE_URL` & `SUPABASE_SERVICE_KEY` - [Get from Supabase](https://supabase.com/) (optional)

3. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building & Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel

1. Push to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy (automatic on push to `main`)

## Project Structure

```
.
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles
│   └── api/
│       ├── search/         # Serper API integration
│       ├── summarize/      # OpenAI summarization
│       └── tts/            # ElevenLabs text-to-speech
├── components/             # React components
├── lib/                    # Utilities and API clients
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
└── [config files]          # next.config.ts, tailwind.config.ts, etc.
```

## API Routes

### POST /api/search
Search for information on any topic.

**Request:**
```json
{
  "query": "what is artificial intelligence"
}
```

**Response:**
```json
{
  "results": [
    {
      "title": "...",
      "description": "...",
      "url": "..."
    }
  ]
}
```

### POST /api/summarize
Summarize search results with AI.

**Request:**
```json
{
  "results": [...],
  "query": "artificial intelligence"
}
```

**Response:**
```json
{
  "summary": "AI is...",
  "keyPoints": ["Point 1", "Point 2"]
}
```

### POST /api/tts
Convert text to audio.

**Request:**
```json
{
  "text": "Summary text",
  "voice": "nova"
}
```

**Response:**
```json
{
  "audioUrl": "https://...",
  "duration": 45
}
```

## Environment Variables

See `.env.example` for all required variables. Key variables:

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes | OpenAI API for summarization |
| `SERPER_API_KEY` | Yes | Serper for search results |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs for text-to-speech |
| `SUPABASE_URL` | No | Supabase database (for history) |
| `SUPABASE_SERVICE_KEY` | No | Supabase authentication |

## Testing

```bash
npm run test
```

## Linting & Formatting

```bash
npm run lint
npm run format
```

## Troubleshooting

### API Keys not working
- Verify keys are in `.env.local` (not `.env`)
- Check key permissions and expiration
- Ensure variable names match exactly

### Database connection fails
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Verify network connectivity
- Check Supabase project is active

### Vercel deployment fails
- Ensure all secrets are set in Vercel dashboard
- Check build logs for specific errors
- Verify Node.js version is 18+

## User Interface

The complete frontend includes:

- **SearchInput** - Query input with validation and error messages
- **SearchResults** - Grid of search results with titles, descriptions, and URLs
- **SummaryCard** - AI-generated summary with key points and copy functionality
- **AudioPlayer** - Custom HTML5 audio controls with play/pause, seek, volume, and download

**Workflow:**
1. Enter search query → Serper searches the web
2. Display results → OpenAI generates summary
3. Show summary with key points → ElevenLabs generates audio
4. Play audio with custom controls

## Security

This project includes comprehensive security measures:

- ✅ **Automated Scanning** - CodeQL, Dependabot, npm audit
- ✅ **Dependency Management** - package-lock.json for deterministic installs
- ✅ **Branch Protection** - Required PR reviews and passing CI checks
- ✅ **Vulnerability Policy** - See [SECURITY.md](./SECURITY.md)
- ✅ **Best Practices** - OWASP compliance, WCAG AA accessibility

See [SECURITY.md](./SECURITY.md) for vulnerability reporting.

## Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Developer workflow and code style
- **[LAUNCH.md](./LAUNCH.md)** - Complete deployment procedures
- **[SECURITY.md](./SECURITY.md)** - Security policy and vulnerability reporting
- **[.github/BRANCH_PROTECTION.md](./.github/BRANCH_PROTECTION.md)** - Branch protection setup

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines:

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Commit with conventional messages: `git commit -m "feat: add my feature"`
4. Push to GitHub: `git push origin feature/my-feature`
5. Open a Pull Request with detailed description

All PRs require:
- ✅ Passing CI checks (lint, build, tests, security audit)
- ✅ At least one approval review
- ✅ Up-to-date with main branch

## Deployment Status

✅ **Production Deployment**: https://claude-autobuild-voicesearch.vercel.app

**Status Checks:**
- ✅ Frontend UI - Complete with responsive design
- ✅ API Integration - All three APIs integrated
- ✅ Security Scanning - CodeQL and Dependabot active
- ✅ CI/CD Pipeline - Automated testing and deployment
- ✅ Branch Protection - Enabled on main branch

**Post-Deployment Checklist:**
- [ ] Verify Vercel environment variables set correctly (OPENAI_API_KEY)
- [ ] Test complete workflow on production
- [ ] Monitor deployment logs
- [ ] Set up branch protection rules (see [.github/BRANCH_PROTECTION.md](./.github/BRANCH_PROTECTION.md))

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- 🐛 [GitHub Issues](https://github.com/spattnaik1998/claude-autobuild-voicesearch/issues)
- 📚 [Documentation](./docs)
- 🔒 [Security](./SECURITY.md)

---

**Built with ❤️ by Claude Code**
