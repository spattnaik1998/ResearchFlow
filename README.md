# ResearchFlow 💡

Search any topic, get AI-summarized answers, and explore with AI-powered follow-up questions.

**[🌐 Live Demo](https://researchflow.vercel.app)** | **[📖 Documentation](#documentation)**

## Features

- 🔍 **Smart Search** - Real-time search results via Serper API
- 🤖 **AI Summaries** - Intelligent summarization with OpenAI GPT-3.5
- ❓ **Related Questions** - AI-generated follow-up questions for deeper exploration
- 📚 **Knowledge Base** - Save searches as permanent notes with markdown editing, tags, and search (NEW!)
- 📱 **Responsive UI** - Mobile-first design (mobile, tablet, desktop)
- ⚡ **Fast & Smooth** - Instant API integration with smooth animations
- 🔒 **Secure** - Branch protection, security scanning, dependency management
- 🚀 **Serverless** - Built with Next.js, deployed on Vercel

## Tech Stack

- **Frontend:** Next.js 15 + TypeScript + React 18 + Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (Postgres)
- **APIs:** OpenAI, Serper
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
   - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` - [Get from Supabase](https://supabase.com/) (for Knowledge Base)

### Setup Checklist

Before running locally, complete these steps:

- [ ] Install Node.js 18+ (`node --version` to check)
- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Create `.env.local` from `.env.example`: `cp .env.example .env.local`
- [ ] Add your API keys to `.env.local`:
  - OPENAI_API_KEY from https://platform.openai.com/api-keys
  - SERPER_API_KEY from https://serper.dev/
- [ ] (Optional) Customize OPENAI_MODEL
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000

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
│       └── questions/      # AI-powered related questions
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

### POST /api/questions
Generate AI-powered follow-up questions based on search query and summary.

**Request:**
```json
{
  "query": "artificial intelligence",
  "summary": "AI is a branch of computer science..."
}
```

**Response:**
```json
{
  "questions": [
    "What are the main types of artificial intelligence?",
    "How does machine learning differ from deep learning?",
    "What are the ethical implications of AI?",
    "..."
  ]
}
```

## Environment Variables

See `.env.example` for all required variables. Key variables:

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes | OpenAI API for summarization and question generation |
| `SERPER_API_KEY` | Yes | Serper for search results |
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

### "API key not configured" error
- Ensure `.env.local` exists in project root (not `.env`)
- Check that all three API keys (OPENAI_API_KEY, SERPER_API_KEY, ELEVENLABS_API_KEY) are present
- Restart dev server after adding keys: `npm run dev`
- Verify key permissions and expiration on respective platforms

### Audio progress bar not working
- Clear browser cache and reload the page
- Check browser console (F12) for JavaScript errors
- Verify audio file downloaded correctly from ElevenLabs
- Test with different audio lengths (short and long summaries)

### TypeScript errors during build
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and rebuild: `rm -rf .next && npm run build`
- Check that you're using Node.js 18+ (`node --version`)

### Search results not appearing
- Check that SERPER_API_KEY is valid and not expired
- Verify network connectivity to Serper API
- Check browser console for specific error messages

### AI summarization fails
- Verify OPENAI_API_KEY is valid and not expired
- Check your OpenAI account has available credits
- Ensure the configured model (OPENAI_MODEL) exists and is accessible
- Check OpenAI API status at https://status.openai.com

### Text-to-speech audio won't play
- Check that ELEVENLABS_API_KEY is valid
- Verify your ElevenLabs account has voice usage available
- Check that the ELEVENLABS_VOICE_ID is correct (if customized)
- Try downloading the audio and playing locally to rule out browser issues

### Database connection fails
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (optional - only needed for history)
- Verify network connectivity
- Check Supabase project is active

### Vercel deployment fails
- Ensure all secrets are set in Vercel dashboard (OPENAI_API_KEY, SERPER_API_KEY, ELEVENLABS_API_KEY)
- Check build logs for specific errors
- Verify Node.js version is 18+ in Vercel project settings

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
