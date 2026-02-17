-- Authentication System Migration
-- Adds user management, workspace-user association, and proper RLS policies

-- Create user_profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_workspaces table for multi-user workspace management
CREATE TABLE IF NOT EXISTS user_workspaces (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  search_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster user workspace queries
CREATE INDEX IF NOT EXISTS idx_user_workspaces_user_id ON user_workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workspaces_created_at ON user_workspaces(created_at DESC);

-- Add user_id to analytics_events if not already present
ALTER TABLE analytics_events
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- Enable RLS on all auth tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workspaces ENABLE ROW LEVEL SECURITY;

-- RLS Policy: user_profiles - Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policy: user_workspaces - Users can only access their own workspaces
CREATE POLICY "Users can view own workspaces"
  ON user_workspaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create workspaces"
  ON user_workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspaces"
  ON user_workspaces FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workspaces"
  ON user_workspaces FOR DELETE
  USING (auth.uid() = user_id);

-- Update RLS policies for existing tables
-- knowledge_notes: Users can only access their own notes
DROP POLICY IF EXISTS "Allow all" ON knowledge_notes;
DROP POLICY IF EXISTS "Allow select all" ON knowledge_notes;
DROP POLICY IF EXISTS "Allow insert all" ON knowledge_notes;
DROP POLICY IF EXISTS "Allow update all" ON knowledge_notes;
DROP POLICY IF EXISTS "Allow delete all" ON knowledge_notes;

CREATE POLICY "Users can view own notes"
  ON knowledge_notes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create notes"
  ON knowledge_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON knowledge_notes FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON knowledge_notes FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- note_tags: Users can only manage tags for their own notes
DROP POLICY IF EXISTS "Allow all" ON note_tags;
DROP POLICY IF EXISTS "Allow select all" ON note_tags;
DROP POLICY IF EXISTS "Allow insert all" ON note_tags;
DROP POLICY IF EXISTS "Allow update all" ON note_tags;
DROP POLICY IF EXISTS "Allow delete all" ON note_tags;

CREATE POLICY "Users can view tags for own notes"
  ON note_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_notes
      WHERE knowledge_notes.id = note_tags.note_id
      AND (knowledge_notes.user_id = auth.uid() OR knowledge_notes.user_id IS NULL)
    )
  );

CREATE POLICY "Users can create tags for own notes"
  ON note_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM knowledge_notes
      WHERE knowledge_notes.id = note_tags.note_id
      AND (knowledge_notes.user_id = auth.uid() OR knowledge_notes.user_id IS NULL)
    )
  );

CREATE POLICY "Users can delete tags for own notes"
  ON note_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_notes
      WHERE knowledge_notes.id = note_tags.note_id
      AND (knowledge_notes.user_id = auth.uid() OR knowledge_notes.user_id IS NULL)
    )
  );

-- analytics_events: Users can only view their own analytics
DROP POLICY IF EXISTS "Allow all" ON analytics_events;
DROP POLICY IF EXISTS "Allow select all" ON analytics_events;
DROP POLICY IF EXISTS "Allow insert all" ON analytics_events;

CREATE POLICY "Users can view own analytics"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can log own analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create trigger to auto-create user_profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
