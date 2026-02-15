-- Analytics System Schema
-- Execute this in Supabase SQL Editor to track user events

-- Create analytics_events table for all event tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'search' | 'summarize' | 'question' | 'note_create' | 'export' | etc.
  event_category TEXT, -- 'search_workflow' | 'knowledge_base' | 'exports' | 'ui_interactions'
  metadata JSONB, -- Flexible JSON for event-specific data
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_workspace ON analytics_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_workspace_created ON analytics_events(workspace_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (Allow all for development)
-- Replace these with user-specific policies when implementing authentication
CREATE POLICY "Allow all operations on analytics_events" ON analytics_events
  FOR ALL USING (true) WITH CHECK (true);

-- Create materialized views for common aggregations
CREATE MATERIALIZED VIEW analytics_daily_searches AS
SELECT
  workspace_id,
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE event_type = 'search') as search_count,
  COUNT(*) FILTER (WHERE event_type = 'summarize') as summary_count,
  COUNT(*) FILTER (WHERE event_type = 'question') as question_count,
  COUNT(*) FILTER (WHERE event_type = 'note_create') as note_create_count,
  COUNT(*) FILTER (WHERE event_type = 'export') as export_count
FROM analytics_events
GROUP BY workspace_id, DATE(created_at)
ORDER BY date DESC;

CREATE INDEX IF NOT EXISTS idx_daily_searches_workspace_date ON analytics_daily_searches(workspace_id, date DESC);

-- Create view for top queries (without materialization for real-time data)
CREATE VIEW analytics_top_queries AS
SELECT
  workspace_id,
  (metadata->>'query') as query,
  COUNT(*) as search_count,
  AVG((metadata->>'duration_ms')::numeric) as avg_duration_ms,
  MAX(created_at) as last_searched_at
FROM analytics_events
WHERE event_type = 'search' AND metadata->>'query' IS NOT NULL
GROUP BY workspace_id, (metadata->>'query')
ORDER BY search_count DESC;

-- Create view for workspace activity comparison
CREATE VIEW analytics_workspace_activity AS
SELECT
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
GROUP BY workspace_id;

-- Create view for hourly activity (for heatmap)
CREATE VIEW analytics_hourly_activity AS
SELECT
  workspace_id,
  DATE_TRUNC('hour', created_at) as hour,
  EXTRACT(HOUR FROM created_at)::integer as hour_of_day,
  EXTRACT(DOW FROM created_at)::integer as day_of_week,
  COUNT(*) as event_count
FROM analytics_events
GROUP BY workspace_id, DATE_TRUNC('hour', created_at), EXTRACT(HOUR FROM created_at), EXTRACT(DOW FROM created_at);
