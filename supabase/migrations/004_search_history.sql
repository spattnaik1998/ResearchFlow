-- Search History Table for Persistent Search Sessions
-- Stores user search queries, results, summaries, and related questions
-- Enables sync across devices and persistence after browser data clears

CREATE TABLE IF NOT EXISTS search_history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL,
  query TEXT NOT NULL,
  results JSONB,
  summary JSONB,
  questions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint: workspace_id references user_workspaces(id)
  CONSTRAINT search_history_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES user_workspaces(id) ON DELETE CASCADE
);

-- Create index for fast lookups by user, workspace, and date
CREATE INDEX IF NOT EXISTS idx_search_history_user_workspace_date
  ON search_history(user_id, workspace_id, created_at DESC);

-- Create index for user + workspace lookups (common query pattern)
CREATE INDEX IF NOT EXISTS idx_search_history_user_workspace
  ON search_history(user_id, workspace_id);

-- Enable RLS (Row Level Security)
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own search history
CREATE POLICY search_history_users_can_select
  ON search_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own search history
CREATE POLICY search_history_users_can_insert
  ON search_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own search history
CREATE POLICY search_history_users_can_update
  ON search_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own search history
CREATE POLICY search_history_users_can_delete
  ON search_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_search_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_search_history_updated_at
  BEFORE UPDATE ON search_history
  FOR EACH ROW
  EXECUTE FUNCTION update_search_history_updated_at();
