# ResearchFlow Setup Verification Checklist

Use this checklist to verify each step of the setup is complete.

## ✅ Code & Infrastructure Ready

- [x] **Migrations Created**: All 3 SQL migration files exist
  - [x] `supabase/migrations/001_knowledge_base_schema.sql` (Knowledge Base tables)
  - [x] `supabase/migrations/002_analytics_system.sql` (Analytics tables)
  - [x] `supabase/migrations/003_authentication_system.sql` (Auth & RLS policies)

- [x] **Authentication System**: All components committed
  - [x] `middleware.ts` - Route protection
  - [x] `lib/auth-helpers.ts` - Auth utilities
  - [x] Auth pages: login, signup, forgot-password, reset-password, verify-email
  - [x] Auth API routes: callback, logout

- [x] **API Routes**: All protected routes ready
  - [x] `/api/search` - Serper integration
  - [x] `/api/summarize` - OpenAI summarization
  - [x] `/api/questions` - AI questions generation
  - [x] `/api/analytics/log` - Event logging
  - [x] `/api/analytics/dashboard` - Analytics data
  - [x] `/api/export/*` - Export functionality

- [x] **Code Quality**:
  - [x] TypeScript: ✔ No errors (0s)
  - [x] ESLint: ✔ No warnings/errors
  - [x] Build: ✔ Production build succeeds

---

## 🔄 Your Setup Tasks (In Order)

### Phase 1: Supabase Setup (Estimated: 15 minutes)

- [ ] **Task 1.1**: Create Supabase account
  - [ ] Sign up at https://supabase.com
  - [ ] Create new project
  - [ ] Wait for provisioning (~2 min)
  - [ ] Verify dashboard loads

- [ ] **Task 1.2**: Run Migration 1 (Knowledge Base)
  - [ ] Go to Supabase SQL Editor
  - [ ] Create new query
  - [ ] Copy/paste `supabase/migrations/001_knowledge_base_schema.sql`
  - [ ] Click Run
  - [ ] Verify: No errors, "Success" message appears

- [ ] **Task 1.3**: Run Migration 2 (Analytics)
  - [ ] Create new query in SQL Editor
  - [ ] Copy/paste `supabase/migrations/002_analytics_system.sql`
  - [ ] Click Run
  - [ ] Verify: No errors

- [ ] **Task 1.4**: Run Migration 3 (Authentication)
  - [ ] Create new query in SQL Editor
  - [ ] Copy/paste `supabase/migrations/003_authentication_system.sql`
  - [ ] Click Run
  - [ ] Verify: No errors

- [ ] **Task 1.5**: Verify tables exist
  - [ ] In Supabase Table Editor, verify these tables exist:
    - [ ] knowledge_notes
    - [ ] note_tags
    - [ ] note_links
    - [ ] collections
    - [ ] collection_notes
    - [ ] analytics_events
    - [ ] user_profiles
    - [ ] user_workspaces

- [ ] **Task 1.6**: Configure Email Auth
  - [ ] Go to Supabase: **Authentication → Providers**
  - [ ] Verify Email is **enabled** (toggle ON)

- [ ] **Task 1.7**: Add Redirect URLs
  - [ ] Go to Supabase: **Authentication → URL Configuration**
  - [ ] Set **Site URL**: `http://localhost:3005`
  - [ ] Add **Redirect URL**: `http://localhost:3005/auth/callback`
  - [ ] Click Save

- [ ] **Task 1.8**: Get API credentials
  - [ ] Go to Supabase: **Settings → API**
  - [ ] Copy **Project URL** (save for next phase)
  - [ ] Copy **Anon / Public key** (save for next phase)
  - [ ] Copy **Service role key** (save for next phase)

### Phase 2: Local Environment Setup (Estimated: 5 minutes)

- [ ] **Task 2.1**: Get OpenAI API key
  - [ ] Visit https://platform.openai.com/api-keys
  - [ ] Create new API key
  - [ ] Copy key (save for next step)

- [ ] **Task 2.2**: Get Serper API key
  - [ ] Visit https://serper.dev/
  - [ ] Sign up / log in
  - [ ] Copy API key (save for next step)

- [ ] **Task 2.3**: Create `.env.local`
  - [ ] In project root, run: `cp .env.example .env.local`
  - [ ] Open `.env.local` in editor
  - [ ] Fill in ALL 6 values:
    ```
    OPENAI_API_KEY=sk-proj-YOUR-KEY
    SERPER_API_KEY=YOUR-KEY
    OPENAI_MODEL=gpt-3.5-turbo
    NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
    SUPABASE_SERVICE_KEY=eyJhbG...
    NEXT_PUBLIC_APP_URL=http://localhost:3005
    ```
  - [ ] Save file

- [ ] **Task 2.4**: Install dependencies
  - [ ] Run: `npm install`
  - [ ] Wait for completion (~1-2 minutes)

- [ ] **Task 2.5**: Start dev server
  - [ ] Run: `npm run dev -- -p 3005`
  - [ ] Wait for "Ready in X.Xs" message
  - [ ] Verify console shows: `✓ Ready in 2.1s`

### Phase 3: Auth Flow Testing (Estimated: 10 minutes)

- [ ] **Task 3.1**: Test signup
  - [ ] Open http://localhost:3005 in browser
  - [ ] Click "Sign Up"
  - [ ] Enter email + password (8+ chars)
  - [ ] Click "Create Account"
  - [ ] Should show "Verify Email" screen
  - [ ] Check email inbox for verification link
  - [ ] Click link in email
  - [ ] Should redirect to http://localhost:3005/app

- [ ] **Task 3.2**: Verify user in Supabase
  - [ ] Go to Supabase: **Authentication → Users**
  - [ ] Your email should appear in list
  - [ ] Go to Supabase: **Table Editor → user_profiles**
  - [ ] Row with your email should exist

- [ ] **Task 3.3**: Test login
  - [ ] Go to http://localhost:3005/auth/login
  - [ ] Enter email + password
  - [ ] Click "Sign In"
  - [ ] Should redirect to /app
  - [ ] Header should show your email

- [ ] **Task 3.4**: Test logout
  - [ ] Click your email in top-right
  - [ ] Click "Sign Out"
  - [ ] Should redirect to /auth/login
  - [ ] Visiting /app again redirects to login

- [ ] **Task 3.5**: Test route protection
  - [ ] Logout (if logged in)
  - [ ] Visit http://localhost:3005/app
  - [ ] Should redirect to login ✓
  - [ ] Visit http://localhost:3005/app/dashboard
  - [ ] Should redirect to login ✓

### Phase 4: API Protection Testing (Estimated: 5 minutes)

- [ ] **Task 4.1**: Test unauthenticated API calls
  - [ ] Open terminal
  - [ ] Run:
    ```bash
    curl -s -X GET http://localhost:3005/api/analytics/dashboard?workspace=all | python -m json.tool
    ```
  - [ ] Expected output: `{"error": "Unauthorized"}`
  - [ ] ✓ API is protected!

### Phase 5: Core Workflow Testing (Estimated: 10 minutes)

- [ ] **Task 5.1**: Test search
  - [ ] Log in at http://localhost:3005/app
  - [ ] Type a query (e.g., "machine learning")
  - [ ] Press Enter
  - [ ] Results should appear from Serper API
  - [ ] Progress shows: Search ✓ → Results ✓

- [ ] **Task 5.2**: Test summarize
  - [ ] Wait 3-5 seconds after results appear
  - [ ] AI summary should auto-generate
  - [ ] Summary should be 150-200 words
  - [ ] Progress shows: Search ✓ → Results ✓ → Summary ✓

- [ ] **Task 5.3**: Test questions
  - [ ] Wait 2-3 seconds after summary
  - [ ] 5-7 related questions should appear
  - [ ] Questions are numbered cards
  - [ ] Progress shows: Search ✓ → Results ✓ → Summary ✓ → Questions ✓

- [ ] **Task 5.4**: Test question click
  - [ ] Click any question
  - [ ] Should trigger new search
  - [ ] Workflow repeats automatically

- [ ] **Task 5.5**: Test save to knowledge base
  - [ ] Click "Save to Knowledge" on any result
  - [ ] Modal opens
  - [ ] Click "Save"
  - [ ] Toast: "Saved to Knowledge Base"

- [ ] **Task 5.6**: Verify data in Supabase
  - [ ] Go to Supabase: **Table Editor → knowledge_notes**
  - [ ] New row should exist with your `user_id`

- [ ] **Task 5.7**: Test analytics dashboard
  - [ ] Visit http://localhost:3005/app/dashboard
  - [ ] Should show analytics of your searches
  - [ ] Charts and stats should render

### Phase 6: Code Quality Verification (Estimated: 5 minutes)

- [ ] **Task 6.1**: TypeScript check
  - [ ] Run: `npx tsc --noEmit`
  - [ ] Should output: `(no errors)`

- [ ] **Task 6.2**: ESLint check
  - [ ] Run: `npm run lint`
  - [ ] Should output: `✔ No ESLint warnings or errors`

- [ ] **Task 6.3**: Build verification
  - [ ] Run: `npm run build`
  - [ ] Should complete successfully

### Phase 7: Production Deployment (Estimated: 10 minutes)

- [ ] **Task 7.1**: Git push
  - [ ] Run: `git status`
  - [ ] Should show: `nothing to commit, working tree clean`
  - [ ] Run: `git push origin main`
  - [ ] Watch Vercel deploy automatically

- [ ] **Task 7.2**: Add Vercel environment variables
  - [ ] In Vercel Dashboard: **Settings → Environment Variables**
  - [ ] Add all 6 variables for Production:
    - [ ] OPENAI_API_KEY
    - [ ] SERPER_API_KEY
    - [ ] OPENAI_MODEL
    - [ ] NEXT_PUBLIC_SUPABASE_URL
    - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
    - [ ] SUPABASE_SERVICE_KEY
  - [ ] Click **Redeploy**

- [ ] **Task 7.3**: Update Supabase redirect URLs
  - [ ] Get your Vercel URL (from Vercel dashboard)
  - [ ] Go to Supabase: **Authentication → URL Configuration**
  - [ ] Add **Redirect URL**: `https://your-app.vercel.app/auth/callback`
  - [ ] Click Save

- [ ] **Task 7.4**: Test production auth
  - [ ] Visit your Vercel URL
  - [ ] Sign up with new email
  - [ ] Verify email (check inbox)
  - [ ] Should redirect to /app
  - [ ] Test search, summary, questions

- [ ] **Task 7.5**: Verify data in production
  - [ ] Go to Supabase: **Table Editor → user_profiles**
  - [ ] Production user should exist
  - [ ] Go to Supabase: **Table Editor → knowledge_notes**
  - [ ] Your saved notes should have user_id

---

## 📋 Summary

**Total estimated time**: 60 minutes (including waits for email)

**Key verification checkpoints**:
1. ✅ All migrations run successfully (check Supabase tables)
2. ✅ `.env.local` filled with 6 values
3. ✅ Dev server starts on port 3005
4. ✅ Can sign up, receive email, verify, and log in
5. ✅ API routes return 401 when unauthenticated
6. ✅ Can search, summarize, and generate questions
7. ✅ Data saves to Supabase with correct user_id
8. ✅ Production deployment succeeds
9. ✅ All code quality checks pass

**When all tasks are complete, ResearchFlow is production-ready!** 🎉

---

**Last Updated**: February 16, 2026
