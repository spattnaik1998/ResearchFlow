-- Migration 006: Convert analytics_daily_searches from materialized view to regular view
-- Materialized views snapshot data and require manual REFRESH to update.
-- A regular view always reflects live data from analytics_events.

-- Drop the materialized view (and its indexes, which CASCADE removes)
DROP MATERIALIZED VIEW IF EXISTS analytics_daily_searches CASCADE;

-- Recreate as a regular view for real-time data
CREATE OR REPLACE VIEW analytics_daily_searches AS
SELECT
  user_id,
  workspace_id,
  DATE(created_at) AS date,
  COUNT(*) FILTER (WHERE event_type = 'search')      AS search_count,
  COUNT(*) FILTER (WHERE event_type = 'summarize')   AS summary_count,
  COUNT(*) FILTER (WHERE event_type = 'question')    AS question_count,
  COUNT(*) FILTER (WHERE event_type = 'note_create') AS note_create_count,
  COUNT(*) FILTER (WHERE event_type = 'export')      AS export_count
FROM analytics_events
GROUP BY user_id, workspace_id, DATE(created_at);
