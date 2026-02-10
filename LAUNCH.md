# LAUNCH.md - Deployment Guide

## Quick Deploy (Vercel)

### Prerequisites
- GitHub token (already provided)
- Vercel account
- 3 API keys set in environment

### Steps
1. **Create Vercel project**
   ```bash
   vercel link
   ```

2. **Add secrets**
   In Vercel dashboard > Settings > Environment Variables:
   - NEXT_PUBLIC_OPENAI_KEY
   - SERPER_API_KEY
   - ELEVENLABS_API_KEY
   - SUPABASE_URL (when ready)
   - SUPABASE_SERVICE_KEY (when ready)

3. **Deploy**
   ```bash
   git push origin main
   # GitHub Actions → Vercel auto-deploys
   ```

## Troubleshooting

### API 500 Error
- Check API keys are set in Vercel dashboard
- Verify key limits/quota at provider dashboard
- Check Vercel logs: `vercel logs`

### Build Fails
- Run locally: `npm run build`
- Check types: `npm run lint`
- Verify env vars are set

## Links
- [Vercel Dashboard](https://vercel.com/dashboard)
- [OpenAI Dashboard](https://platform.openai.com)
- [Serper Dashboard](https://serper.dev/dashboard)
- [ElevenLabs Dashboard](https://elevenlabs.io/app)

See full guide at bottom of LAUNCH.md (expanded version).
