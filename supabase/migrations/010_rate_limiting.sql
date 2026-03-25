-- Migration 010: Rate Limiting Infrastructure
-- Adds per-user, per-action rate limiting table with sliding window support
-- Prevents malicious or runaway usage of paid API endpoints (Serper, OpenAI)

-- Create rate limit buckets table
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('search', 'summarize', 'questions')),
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 1 CHECK (count > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, action, window_start)
);

-- Enable RLS
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only see/manage their own rate limit buckets
CREATE POLICY "Users can view own rate limits" ON public.rate_limit_buckets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limits" ON public.rate_limit_buckets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits" ON public.rate_limit_buckets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for efficient lookups in rate limit checks
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action_window
  ON public.rate_limit_buckets(user_id, action, window_start DESC);

-- Index for cleanup queries (removing old windows)
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start
  ON public.rate_limit_buckets(window_start);

-- Comment for documentation
COMMENT ON TABLE public.rate_limit_buckets IS 'Sliding window rate limiting buckets for paid API endpoints. Each hour is a separate window. Used to track search, summarize, and question generation API usage per user.';

COMMENT ON COLUMN public.rate_limit_buckets.action IS 'API action type: search (30/hr), summarize (20/hr), questions (20/hr)';

COMMENT ON COLUMN public.rate_limit_buckets.window_start IS 'Start timestamp of the 1-hour window for this bucket. Allows sliding window implementation.';

COMMENT ON COLUMN public.rate_limit_buckets.count IS 'Number of API calls for this action in this window. Once it reaches the limit, further calls are rejected.';
