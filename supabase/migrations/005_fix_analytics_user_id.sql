-- Fix analytics tables to add missing user_id column
-- This migration updates the existing analytics tables to include user_id
-- Run this if you've already executed migration 002_analytics_system.sql

-- Step 1: Check if analytics_events has user_id column, if not add it
ALTER TABLE IF EXISTS analytics_events
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT gen_random_uuid();

-- Step 2: Add user_id index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_workspace ON analytics_events(user_id, workspace_id);

-- Step 3: Recreate the RLS policies with user-specific rules
-- First drop existing policies
DROP POLICY IF EXISTS "Allow all operations on analytics_events" ON analytics_events;

-- Create new user-scoped RLS policies
CREATE POLICY "Users can view their own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" ON analytics_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics" ON analytics_events
  FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Recreate materialized view with user_id
DROP MATERIALIZED VIEW IF EXISTS analytics_daily_searches CASCADE;

CREATE MATERIALIZED VIEW analytics_daily_searches AS
SELECT
  user_id,
  workspace_id,
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE event_type = 'search') as search_count,
  COUNT(*) FILTER (WHERE event_type = 'summarize') as summary_count,
  COUNT(*) FILTER (WHERE event_type = 'question') as question_count,
  COUNT(*) FILTER (WHERE event_type = 'note_create') as note_create_count,
  COUNT(*) FILTER (WHERE event_type = 'export') as export_count
FROM analytics_events
GROUP BY user_id, workspace_id, DATE(created_at)
ORDER BY date DESC;

CREATE INDEX IF NOT EXISTS idx_daily_searches_user ON analytics_daily_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_searches_workspace_date ON analytics_daily_searches(workspace_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_searches_user_workspace_date ON analytics_daily_searches(user_id, workspace_id, date DESC);

-- Step 5: Recreate views with user_id
DROP VIEW IF EXISTS analytics_top_queries CASCADE;

CREATE VIEW analytics_top_queries AS
SELECT
  user_id,
  workspace_id,
  (metadata->>'query') as query,
  COUNT(*) as search_count,
  AVG((metadata->>'duration_ms')::numeric) as avg_duration_ms,
  MAX(created_at) as last_searched_at
FROM analytics_events
WHERE event_type = 'search' AND metadata->>'query' IS NOT NULL
GROUP BY user_id, workspace_id, (metadata->>'query')
ORDER BY search_count DESC;

DROP VIEW IF EXISTS analytics_workspace_activity CASCADE;

CREATE VIEW analytics_workspace_activity AS
SELECT
  user_id,
  workspace_id,
  COUNT(*) FILTER (WHERE event_type = 'search') as total_searches,
  COUNT(*) FILTER (WHERE event_type = 'summarize') as total_summaries,
  COUNT(*) FILTER (WHERE event_type = 'question') as total_questions,
  COUNT(*) FILTER (WHERE event_type = 'note_create') as total_notes_created,
  COUNT(*) FILTER (WHERE event_type = 'export') as total_exports,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  MIN(created_at) as first_event_at,
  MAX(created_at) as last_event_at
FROM analytics_events
GROUP BY user_id, workspace_id;

DROP VIEW IF EXISTS analytics_hourly_activity CASCADE;

CREATE VIEW analytics_hourly_activity AS
SELECT
  user_id,
  workspace_id,
  DATE_TRUNC('hour', created_at) as hour,
  EXTRACT(HOUR FROM created_at)::integer as hour_of_day,
  EXTRACT(DOW FROM created_at)::integer as day_of_week,
  COUNT(*) as event_count
FROM analytics_events
GROUP BY user_id, workspace_id, DATE_TRUNC('hour', created_at), EXTRACT(HOUR FROM created_at), EXTRACT(DOW FROM created_at);
