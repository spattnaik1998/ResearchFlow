# Deployment & Launch Guide

Complete checklist and procedures for deploying ResearchFlow.

## Pre-Launch Checklist

- [ ] All tests pass locally (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linter passes (`npm run lint`)
- [ ] TypeScript has no errors (`npx tsc --noEmit`)
- [ ] All environment variables configured
- [ ] Security scanning enabled
- [ ] Branch protection rules configured
- [ ] README.md and documentation updated

## Deployment Steps

### 1. Prepare for Production

```bash
# Create feature branch
git checkout -b feature/production-release

# Verify build
npm run build

# Run tests
npm run test

# Check lint
npm run lint
```

### 2. Configure Environment Variables

On Vercel dashboard:

1. Go to **Settings → Environment Variables**
2. Add the following secrets:
   - `OPENAI_API_KEY` - OpenAI API key
   - `SERPER_API_KEY` - Serper search API key
   - `ELEVENLABS_API_KEY` - ElevenLabs TTS API key
   - `SUPABASE_URL` - Supabase project URL
   - `SUPABASE_SERVICE_KEY` - Supabase service role key

3. Ensure variables are applied to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### 3. Enable Security Features

#### Branch Protection (GitHub)

```bash
# Using GitHub CLI (requires GitHub CLI installed)
gh repo rule create \
  --require-approvals=1 \
  --require-status-checks=true \
  --require-linear-history=true \
  --require-code-owners=true
```

Or manually in **Settings → Branches → Add Rule**:

- Branch name pattern: `main`
- Require pull request reviews (1 approval minimum)
- Require status checks to pass:
  - Lint & Type Check
  - Build
  - Tests
  - Security Audit
- Require branches to be up to date
- Require code owners' approval
- Dismiss stale PR approvals
- Restrict who can push to matching branches

#### CodeQL Scanning

CodeQL runs automatically via `.github/workflows/codeql.yml`:
- Triggered on push to `main`
- Runs on schedule (weekly)
- Results available in **Security → Code scanning**

#### Dependabot

Dependabot is configured via `.github/dependabot.yml`:
- Checks for npm updates weekly
- Opens PRs for security updates
- Labels with `dependencies` and `automated`

### 4. Commit and Push

```bash
git add .
git commit -m "chore: prepare for production launch

- Environment variables configured
- Security features enabled
- Branch protection rules configured

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin feature/production-release
```

### 5. Create Pull Request

On GitHub:

1. Create PR from `feature/production-release` → `main`
2. Verify all CI checks pass
3. Get required approvals
4. Merge to `main`

### 6. Monitor First Deployment

After merge, verify production deployment:

```bash
# Check deployment status on Vercel dashboard
# Should show "Production" with green checkmark

# Test API endpoints:
curl -X POST https://claude-autobuild-voicesearch.vercel.app/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "artificial intelligence"}'

# Visit production URL
# https://claude-autobuild-voicesearch.vercel.app
```

### 7. Verify Features

- ✅ Search functionality works
- ✅ Results display correctly
- ✅ Summary generation succeeds
- ✅ Audio playback works
- ✅ No console errors
- ✅ Responsive design on mobile
- ✅ Lighthouse scores > 90

## API Key Rotation

Rotate API keys every 90 days for security.

### OpenAI API Key Rotation

1. Generate new key in [OpenAI dashboard](https://platform.openai.com/api-keys)
2. Update in Vercel:
   - Go to Settings → Environment Variables
   - Update `OPENAI_API_KEY` with new value
   - Deployment automatically triggers with new env
3. Verify in production (make a search)
4. Delete old key from OpenAI dashboard

### Serper API Key Rotation

1. Generate new key in Serper dashboard
2. Update `SERPER_API_KEY` in Vercel Environment Variables
3. Redeploy to production
4. Delete old key from Serper

### ElevenLabs API Key Rotation

1. Generate new key in ElevenLabs dashboard
2. Update `ELEVENLABS_API_KEY` in Vercel Environment Variables
3. Redeploy
4. Delete old key from ElevenLabs

### Supabase Keys Rotation

If using Supabase:

1. Generate new service role key in Supabase dashboard
2. Update `SUPABASE_SERVICE_KEY` in Vercel
3. Verify database access works
4. Delete old key

## Emergency Procedures

### Rollback Deployment

If production deployment has critical issues:

```bash
# On Vercel dashboard:
# 1. Go to Deployments
# 2. Find previous stable deployment
# 3. Click "Promote to Production"
# Or use CLI:
vercel --prod --env OPENAI_API_KEY=<previous-value>
```

### Revoke Compromised API Key

If an API key is compromised:

1. **Immediately revoke** the key in the service dashboard
2. **Generate a new key**
3. **Update in Vercel** Environment Variables
4. **Monitor** for unauthorized usage
5. **Contact** the API service support if needed

```bash
# Example: Revoke OpenAI key
# Visit https://platform.openai.com/api-keys
# Delete the compromised key
# Generate replacement and update Vercel
```

### Critical Bug Fix

If critical bug found in production:

```bash
git checkout -b fix/critical-issue
# Make fix
git add .
git commit -m "fix: critical production issue

Description of the fix"

git push origin fix/critical-issue
# Create PR, request expedited review
# Merge to main
# Vercel automatically deploys
```

## Monitoring & Logging

### Check Deployment Status

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/YOUR_ORG/claude-autobuild-voicesearch/actions
- **CodeQL Results**: Settings → Security → Code scanning

### Monitor Application

- Check browser console for errors
- Use Vercel's analytics dashboard
- Monitor API response times
- Check error logs in Vercel Functions

### GitHub Actions Workflow Status

```bash
# Check workflow status
gh run list --repo=YOUR_ORG/claude-autobuild-voicesearch

# View recent run details
gh run view <run-id>
```

## Scaling Considerations

As usage grows:

1. **API Rate Limits**
   - Monitor Serper, OpenAI, ElevenLabs quota usage
   - Upgrade plan if approaching limits
   - Implement request queuing if needed

2. **Performance**
   - Use Vercel's analytics to identify slow endpoints
   - Consider caching search results
   - Optimize audio generation

3. **Database (Supabase)**
   - Monitor row counts and storage
   - Implement retention policies for old searches
   - Scale database tier if needed

## Support & Troubleshooting

### Common Issues

**"API Key not found" error**
- Verify environment variables in Vercel
- Check variable names exactly match code
- Wait 5 minutes after updating for propagation

**Search results empty**
- Check Serper API quota
- Verify API key is valid
- Check internet connectivity

**Audio generation fails**
- Check ElevenLabs API status
- Verify API key has sufficient quota
- Check text length (ElevenLabs has character limits)

**Deployment fails**
- Check GitHub Actions logs
- Verify all CI checks pass
- Look for lint or TypeScript errors
- Ensure npm dependencies are correct

## Contacts & Resources

- **GitHub Issues**: Report bugs and feature requests
- **Security**: See SECURITY.md for vulnerability reporting
- **Contributing**: See CONTRIBUTING.md for development
- **Documentation**: See README.md for user guide

## Post-Launch

1. **Monitor** metrics and user feedback
2. **Gather** analytics on feature usage
3. **Update** documentation based on feedback
4. **Plan** next features and improvements
5. **Schedule** regular API key rotations

---

Last Updated: 2026-02-10
