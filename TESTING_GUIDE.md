# ResearchFlow: Complete Testing Guide

**Status**: ✅ All code is ready. This guide covers database setup and testing workflows.

---

## Quick Start Checklist

- [ ] Step 1: Create Supabase account
- [ ] Step 2: Run 3 SQL migrations
- [ ] Step 3: Configure redirect URLs
- [ ] Step 4: Create `.env.local` with API keys
- [ ] Step 5: Run `npm run dev -- -p 3005`
- [ ] Step 6: Test auth flow locally
- [ ] Step 7: Test API protection (curl)
- [ ] Step 8: Test core workflow
- [ ] Step 9: Deploy to Vercel
- [ ] Step 10: Production testing

**Estimated Time**: 30-45 minutes (including email verification waits)

---

## Step 1: Create Supabase Project

### 1a. Sign Up for Supabase
1. Go to **https://supabase.com** and sign up (free tier works)
2. Create a new organization
3. Create a new project
4. Choose region closest to you
5. Wait ~1-2 minutes for provisioning

### 1b. Verify Project Created
- Once ready, you'll see the Supabase dashboard
- Go to **SQL Editor** in the left sidebar
- You should see an empty list of queries

---

## Step 2: Run Database Migrations (IN ORDER)

**CRITICAL**: Run these in the exact order shown. Copy/paste each migration file into the SQL Editor.

### 2a. Migration 1: Knowledge Base Schema

1. In Supabase → **SQL Editor** → click **New query**
2. Copy the entire contents from this file:
   ```
   supabase/migrations/001_knowledge_base_schema.sql
   ```
3. Paste into the SQL Editor
4. Click **Run** (or Ctrl+Enter)
5. Verify success: No errors appear, and you see "Success" message

**What this creates:**
- `knowledge_notes` table (saved research notes)
- `note_tags` table (note categorization)
- `note_links` table (connections between notes)
- `collections` table (note organization)
- `collection_notes` table (collection membership)
- Views: `notes_with_tags`, `notes_with_link_count`

### 2b. Migration 2: Analytics System

1. In Supabase → **SQL Editor** → click **New query**
2. Copy the entire contents from:
   ```
   supabase/migrations/002_analytics_system.sql
   ```
3. Paste and click **Run**
4. Verify success

**What this creates:**
- `analytics_events` table (all event tracking)
- Materialized view: `analytics_daily_searches` (daily aggregations)
- Views: `analytics_top_queries`, `analytics_workspace_activity`, `analytics_hourly_activity`

### 2c. Migration 3: Authentication System

1. In Supabase → **SQL Editor** → click **New query**
2. Copy the entire contents from:
   ```
   supabase/migrations/003_authentication_system.sql
   ```
3. Paste and click **Run**
4. Verify success

**What this creates:**
- `user_profiles` table (extends auth.users)
- `user_workspaces` table (per-user workspaces)
- Adds `user_id` column to `analytics_events`
- Row-Level Security (RLS) policies (per-user data isolation)
- Trigger: Auto-creates `user_profiles` on signup

### 2d. Verify All Tables Exist

Go to **Table Editor** in left sidebar. You should see these tables:

```
✓ knowledge_notes
✓ note_tags
✓ note_links
✓ collections
✓ collection_notes
✓ analytics_events
✓ user_profiles
✓ user_workspaces
```

If any are missing, scroll up to the corresponding migration and check for errors.

---

## Step 3: Enable Email Auth & Configure URLs

### 3a. Enable Email Provider
In Supabase dashboard:
1. Go to **Authentication** (left sidebar)
2. Click **Providers**
3. Verify **Email** is enabled (usually is by default)
4. Look for toggle/checkbox — it should be ON

### 3b. Configure Redirect URLs
In Supabase dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Under **Site URL**, set:
   ```
   http://localhost:3005
   ```
3. Under **Redirect URLs**, add BOTH:
   ```
   http://localhost:3005/auth/callback
   ```
   (Don't add Vercel URL yet — do that after deployment)

4. Click **Save**

### 3c. Get Your Credentials

In Supabase dashboard:
1. Go to **Settings** (left sidebar, bottom)
2. Click **API**
3. Copy these values:
   - **Project URL** → save as `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon / Public key** → save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role key** → save as `SUPABASE_SERVICE_KEY`

Keep these values handy for the next step!

---

## Step 4: Create `.env.local` File

### 4a. Copy Template
In your terminal, from the project root:
```bash
cp .env.example .env.local
```

### 4b. Fill in Your Keys

Open `.env.local` in your editor and fill in:

```env
# Search & Summarization API Keys
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
SERPER_API_KEY=YOUR-KEY-HERE
OPENAI_MODEL=gpt-3.5-turbo

# Supabase (from Step 3c)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3005
```

**Where to get these keys:**
- **OPENAI_API_KEY**: https://platform.openai.com/api-keys
- **SERPER_API_KEY**: https://serper.dev/
- **Supabase keys**: From Step 3c above

### 4c. Verify Locally (Optional)
```bash
cat .env.local | grep SUPABASE
```

You should see your Supabase URL and keys (no "https://xxx" means it's not filled in).

---

## Step 5: Install Dependencies & Start Dev Server

### 5a. Install Node Modules
```bash
npm install
```

This installs all dependencies and should complete in 1-2 minutes.

### 5b. Start Dev Server on Port 3005
```bash
npm run dev -- -p 3005
```

Expected output:
```
> next dev -p 3005
  ▲ Next.js 15.1.3
  - Local:        http://localhost:3005
  ✓ Ready in 2.1s
```

**If you see this, success!** Dev server is running.

### 5c. Open in Browser
Open: **http://localhost:3005**

You should see the landing page with:
- ResearchFlow logo
- Navigation menu
- "Sign In" and "Sign Up" buttons

---

## Step 6: Test Authentication Flow

### 6a. Test Sign Up
1. Click **Sign Up** button (or visit http://localhost:3005/auth/signup)
2. Enter an email you can access
3. Enter a password (8+ characters)
4. Click **Create Account**
5. You should see: **"Verify Email"** message
6. Check your email inbox for a confirmation link
7. Click the link → browser should redirect to **http://localhost:3005/app**

**Verify in Supabase:**
- Go to **Authentication → Users**
- Your email should appear in the users list
- Go to **Table Editor → user_profiles**
- A row should exist with your email (auto-created by trigger)

### 6b. Test Login
1. Go to http://localhost:3005/auth/login
2. Enter your email and password
3. Click **Sign In**
4. Should redirect to http://localhost:3005/app
5. Header (top right) should show your email in the **User Menu**

### 6c. Test Logout
1. Click your email/avatar in the top-right corner
2. Click **Sign Out**
3. Should redirect to http://localhost:3005/auth/login
4. Visiting /app again redirects back to login (protected)

### 6d. Test Protected Routes
While **NOT logged in**:
- Visit http://localhost:3005/app → redirects to login ✓
- Visit http://localhost:3005/app/dashboard → redirects to login ✓

While **logged in**:
- Visit http://localhost:3005/auth/login → redirects back to /app ✓

### 6e. Test Forgot Password
1. Go to http://localhost:3005/auth/forgot-password
2. Enter your email
3. Click **Send Reset Email**
4. Check your email for reset link
5. Click link → opens http://localhost:3005/auth/reset-password?token=...
6. Enter new password
7. Click **Reset Password**
8. Should redirect to login
9. Log in with new password

---

## Step 7: Test API Protection (Curl)

All API routes require authentication. Test that unauthenticated requests return 401:

### 7a. Test Search API
```bash
curl -s -X POST http://localhost:3005/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}' | python -m json.tool
```

Expected response:
```json
{
  "error": "Unauthorized"
}
```

### 7b. Test Summarize API
```bash
curl -s -X POST http://localhost:3005/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"results":[]}' | python -m json.tool
```

Expected: `{"error": "Unauthorized"}`

### 7c. Test Questions API
```bash
curl -s -X POST http://localhost:3005/api/questions \
  -H "Content-Type: application/json" \
  -d '{"query":"test","summary":"test"}' | python -m json.tool
```

Expected: `{"error": "Unauthorized"}`

### 7d. Test Analytics API
```bash
curl -s -X GET "http://localhost:3005/api/analytics/dashboard?workspace=all" \
  | python -m json.tool
```

Expected: `{"error": "Unauthorized"}`

---

## Step 8: Test Core App Workflow

### 8a. Make Sure You're Logged In
- Go to http://localhost:3005/app
- You should see the search interface (not login page)
- Header shows your email in top-right

### 8b. Test Search
1. Type a query in the search box (e.g., "machine learning")
2. Press Enter or click Search
3. Wait 2-3 seconds
4. Results should appear from Serper API
5. Progress should show: Search ✓ → Results ✓

### 8c. Test Summarize
1. After results appear, AI summary should auto-generate
2. Wait 3-5 seconds
3. Summary card should appear with 150-200 word comprehensive summary
4. Progress should show: Search ✓ → Results ✓ → Summary ✓

### 8d. Test Questions
1. After summary appears, 5-7 related questions should auto-generate
2. Wait 2-3 seconds
3. Questions should appear as numbered cards
4. Progress should show: Search ✓ → Results ✓ → Summary ✓ → Questions ✓

### 8e. Test Question Click
1. Click any question
2. Should trigger new search with that question as query
3. Workflow repeats: Results → Summary → Questions

### 8f. Test Save to Knowledge Base
1. Click "Save to Knowledge" button on any search result
2. Knowledge Base modal should open
3. Fill in optional title/notes
4. Click "Save"
5. Modal should close
6. Toast notification: "Saved to Knowledge Base"

**Verify in Supabase:**
- Go to **Table Editor → knowledge_notes**
- A new row should exist with your `user_id` and content

### 8g. Test Analytics Dashboard
1. Go to http://localhost:3005/app/dashboard
2. Should show analytics with your searches
3. Test the workspace selector dropdown (🌐 All Workspaces)
4. Charts and stats should display

---

## Step 9: Code Quality Checks

Before deploying, verify everything passes:

### 9a. TypeScript Check
```bash
npx tsc --noEmit
```

Should output: `(no errors)`

### 9b. ESLint Check
```bash
npm run lint
```

Should output: `✔ No ESLint warnings or errors`

### 9c. Production Build
```bash
npm run build
```

Should complete successfully with no errors.

---

## Step 10: Deploy to Vercel

### 10a. Verify Git Status
```bash
git status
```

Should show: `nothing to commit, working tree clean`

If not, you have local changes. Commit them:
```bash
git add .
git commit -m "Your message here"
```

### 10b. Push to GitHub
```bash
git push origin main
```

This automatically triggers Vercel deployment.

### 10c. Monitor Deployment
1. Go to your Vercel project dashboard
2. You should see a new deployment starting
3. Wait for it to complete (usually 1-2 minutes)
4. Once done, you'll see a production URL

### 10d. Add Environment Variables to Vercel
1. In Vercel dashboard: **Settings → Environment Variables**
2. Add these variables for **Production**:

| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | `sk-proj-...` |
| `SERPER_API_KEY` | `...` |
| `OPENAI_MODEL` | `gpt-3.5-turbo` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` |
| `SUPABASE_SERVICE_KEY` | `eyJhbG...` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

3. After adding, click **Redeploy** to apply them

### 10e. Update Supabase Redirect URLs
In Supabase dashboard:
1. Go to **Authentication → URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   ```
3. Click **Save**

---

## Step 11: Production Testing

### 11a. Test Auth Flow at Vercel URL
1. Visit `https://your-app.vercel.app`
2. Sign up with a new email
3. Verify email (check inbox)
4. Should redirect to `/app`
5. Test logout and login again

### 11b. Test Core Workflow
1. Search for a query
2. Verify results, summary, and questions generate
3. Save a note to Knowledge Base

### 11c. Test API Protection (Vercel)
```bash
curl -s -X GET "https://your-app.vercel.app/api/analytics/dashboard?workspace=all" \
  | python -m json.tool
```

Should return: `{"error": "Unauthorized"}`

### 11d. Verify Supabase Data
1. Go to your Supabase project
2. **Table Editor → user_profiles** → should have your production user
3. **Table Editor → knowledge_notes** → should have your saved notes with `user_id`

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Email never arrives | Free tier email limit (3/hour) | Wait 1 hour, or use different email |
| `/app` doesn't redirect | Middleware not running | Check `middleware.ts` exists |
| `Unauthorized` on all APIs | Environment variables missing | Verify `.env.local` has all 6 variables |
| Signup button does nothing | Supabase not initialized | Check `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` |
| `Column "user_id" does not exist` | Migration 003 not run | Run migration 003 in Supabase SQL Editor |
| Tables don't show in Supabase | Migrations failed | Check for SQL errors in editor |
| Vercel deployment fails | Missing env vars | Add all 6 variables in Vercel dashboard |
| "Redirect URL not allowed" | URL not in Supabase whitelist | Add to **Auth → URL Configuration** |

---

## Summary

You now have a fully functional, authenticated research application with:

✅ Multi-user support with email authentication
✅ Workspace isolation per user
✅ Protected API routes (401 for unauthenticated)
✅ Knowledge base with persistent storage
✅ Analytics tracking with Supabase RLS
✅ Search, summarization, and AI questions
✅ Production deployment to Vercel

**Ready for user testing and production use!**

---

**Last Updated**: February 16, 2026
