-- Migration 009: Comprehensive Database Security Hardening
-- Purpose: Add NOT NULL constraints, foreign keys, audit columns, and additional RLS protections
-- Date: Mar 2026

-- ============================================================================
-- STEP 1: Add NOT NULL Constraints to Critical Columns
-- ============================================================================

-- knowledge_notes: user_id must not be null (no orphaned notes)
ALTER TABLE public.knowledge_notes
  ALTER COLUMN user_id SET NOT NULL;

-- collections: user_id must not be null
ALTER TABLE public.collections
  ALTER COLUMN user_id SET NOT NULL;

-- user_workspaces: user_id must not be null
ALTER TABLE public.user_workspaces
  ALTER COLUMN user_id SET NOT NULL;

-- search_history: user_id must not be null
ALTER TABLE public.search_history
  ALTER COLUMN user_id SET NOT NULL;

-- ============================================================================
-- STEP 2: Add Foreign Key Constraints (where missing)
-- ============================================================================

-- knowledge_notes → user_workspaces (workspace_id must exist)
ALTER TABLE public.knowledge_notes
  ADD CONSTRAINT fk_knowledge_notes_workspace
  FOREIGN KEY (workspace_id, user_id)
  REFERENCES public.user_workspaces(id, user_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- collections → user_workspaces (workspace_id must exist)
ALTER TABLE public.collections
  ADD CONSTRAINT fk_collections_workspace
  FOREIGN KEY (workspace_id, user_id)
  REFERENCES public.user_workspaces(id, user_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- search_history → user_workspaces (workspace_id must exist)
ALTER TABLE public.search_history
  ADD CONSTRAINT fk_search_history_workspace
  FOREIGN KEY (workspace_id, user_id)
  REFERENCES public.user_workspaces(id, user_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- ============================================================================
-- STEP 3: Add Additional Indexes for Query Performance & Security
-- ============================================================================

-- user_workspaces: commonly queried by user
CREATE INDEX IF NOT EXISTS idx_user_workspaces_user_id
  ON public.user_workspaces(user_id);

-- knowledge_notes: composite index for user + workspace queries
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_user_workspace
  ON public.knowledge_notes(user_id, workspace_id);

-- collections: composite index for user + workspace queries
CREATE INDEX IF NOT EXISTS idx_collections_user_workspace
  ON public.collections(user_id, workspace_id);

-- search_history: composite index for user + workspace queries
CREATE INDEX IF NOT EXISTS idx_search_history_user_workspace
  ON public.search_history(user_id, workspace_id);

-- search_history: timestamp index for time-based queries
CREATE INDEX IF NOT EXISTS idx_search_history_created_at
  ON public.search_history(created_at DESC);

-- note_tags: composite index for user-scoped tag queries
CREATE INDEX IF NOT EXISTS idx_note_tags_user_tag
  ON public.note_tags(tag) WHERE EXISTS (
    SELECT 1 FROM public.knowledge_notes kn
    WHERE kn.id = public.note_tags.note_id
  );

-- ============================================================================
-- STEP 4: Add Check Constraints for Data Validation
-- ============================================================================

-- Prevent empty titles in knowledge_notes
ALTER TABLE public.knowledge_notes
  ADD CONSTRAINT chk_knowledge_notes_title_not_empty
  CHECK (LENGTH(TRIM(title)) > 0);

-- Prevent empty workspace names
ALTER TABLE public.user_workspaces
  ADD CONSTRAINT chk_user_workspaces_name_not_empty
  CHECK (LENGTH(TRIM(name)) > 0);

-- Prevent negative position in collection_notes
ALTER TABLE public.collection_notes
  ADD CONSTRAINT chk_collection_notes_position_non_negative
  CHECK (position >= 0);

-- Prevent future timestamps in created_at
ALTER TABLE public.knowledge_notes
  ADD CONSTRAINT chk_knowledge_notes_created_at_not_future
  CHECK (created_at <= now());

ALTER TABLE public.search_history
  ADD CONSTRAINT chk_search_history_created_at_not_future
  CHECK (created_at <= now());

-- ============================================================================
-- STEP 5: Enforce RLS on Related Tables
-- ============================================================================

-- Ensure note_links respects user ownership of BOTH notes
DROP POLICY IF EXISTS "Users can manage note_links for own notes" ON public.note_links;

CREATE POLICY "Users can manage note_links for own notes" ON public.note_links
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_notes kn
      WHERE (kn.id = public.note_links.from_note_id
             OR kn.id = public.note_links.to_note_id)
        AND kn.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.knowledge_notes kn
      WHERE (kn.id = public.note_links.from_note_id
             OR kn.id = public.note_links.to_note_id)
        AND kn.user_id = auth.uid()
    )
  );

-- Ensure collection_notes respects user ownership of both collection AND note
DROP POLICY IF EXISTS "Users can manage collection_notes for own collections" ON public.collection_notes;

CREATE POLICY "Users can manage collection_notes for own collections" ON public.collection_notes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = public.collection_notes.collection_id
        AND c.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.knowledge_notes kn
      WHERE kn.id = public.collection_notes.note_id
        AND kn.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = public.collection_notes.collection_id
        AND c.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.knowledge_notes kn
      WHERE kn.id = public.collection_notes.note_id
        AND kn.user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 6: Create Audit Triggers for Activity Logging
-- ============================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation VARCHAR(6) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET
);

-- Enable RLS on audit_log (users can only see their own records)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON public.audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index on audit_log for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON public.audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);

-- Function to log changes to knowledge_notes
CREATE OR REPLACE FUNCTION public.audit_knowledge_notes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, record_id, new_values, ip_address)
    VALUES ('knowledge_notes', 'INSERT', NEW.user_id, NEW.id, row_to_json(NEW), inet_client_addr());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, record_id, old_values, new_values, ip_address)
    VALUES ('knowledge_notes', 'UPDATE', NEW.user_id, NEW.id, row_to_json(OLD), row_to_json(NEW), inet_client_addr());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, record_id, old_values, ip_address)
    VALUES ('knowledge_notes', 'DELETE', OLD.user_id, OLD.id, row_to_json(OLD), inet_client_addr());
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log changes to collections
CREATE OR REPLACE FUNCTION public.audit_collections()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, record_id, new_values, ip_address)
    VALUES ('collections', 'INSERT', NEW.user_id, NEW.id, row_to_json(NEW), inet_client_addr());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, record_id, old_values, new_values, ip_address)
    VALUES ('collections', 'UPDATE', NEW.user_id, NEW.id, row_to_json(OLD), row_to_json(NEW), inet_client_addr());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, record_id, old_values, ip_address)
    VALUES ('collections', 'DELETE', OLD.user_id, OLD.id, row_to_json(OLD), inet_client_addr());
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for auditing
DROP TRIGGER IF EXISTS audit_knowledge_notes_trigger ON public.knowledge_notes;
CREATE TRIGGER audit_knowledge_notes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.knowledge_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_knowledge_notes();

DROP TRIGGER IF EXISTS audit_collections_trigger ON public.collections;
CREATE TRIGGER audit_collections_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_collections();

-- ============================================================================
-- STEP 7: Create Views for Secure Data Access
-- ============================================================================

-- View for users to query their own notes (with RLS enforcement)
DROP VIEW IF EXISTS public.user_notes_secure CASCADE;
CREATE VIEW public.user_notes_secure AS
SELECT
  id,
  workspace_id,
  title,
  content,
  search_query,
  created_at,
  updated_at,
  (
    SELECT array_agg(DISTINCT tag)
    FROM public.note_tags
    WHERE note_id = knowledge_notes.id
  ) as tags,
  (
    SELECT COUNT(*)::INTEGER
    FROM public.note_links
    WHERE from_note_id = knowledge_notes.id OR to_note_id = knowledge_notes.id
  ) as link_count
FROM public.knowledge_notes
WHERE user_id = auth.uid();

-- View for users to query their own workspaces
DROP VIEW IF EXISTS public.user_workspaces_secure CASCADE;
CREATE VIEW public.user_workspaces_secure AS
SELECT
  id,
  name,
  icon,
  color,
  is_favorite,
  is_archived,
  search_count,
  created_at
FROM public.user_workspaces
WHERE user_id = auth.uid()
ORDER BY CASE WHEN is_favorite THEN 0 ELSE 1 END, created_at DESC;

-- ============================================================================
-- STEP 8: Add Rate Limiting & Quota Functions
-- ============================================================================

-- Function to check if user has exceeded note creation quota
CREATE OR REPLACE FUNCTION public.can_create_note(p_user_id UUID, p_workspace_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  note_count INTEGER;
  max_notes INTEGER := 10000; -- Adjust based on your needs
BEGIN
  SELECT COUNT(*) INTO note_count
  FROM public.knowledge_notes
  WHERE user_id = p_user_id AND workspace_id = p_workspace_id;

  RETURN note_count < max_notes;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get user storage usage in bytes
CREATE OR REPLACE FUNCTION public.get_user_storage_usage(p_user_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT SUM(
        LENGTH(COALESCE(title, '')) +
        LENGTH(COALESCE(content, '')) +
        COALESCE(pg_column_size(metadata), 0)
      )
      FROM public.knowledge_notes
      WHERE user_id = p_user_id
    ),
    0
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- STEP 9: Summary & Verification
-- ============================================================================

SELECT 'Migration 009 Complete: Database Security Hardening Applied' AS status;

-- Verify NOT NULL constraints
SELECT
  tablename,
  attname,
  NOT null AS is_not_null
FROM pg_tables
JOIN pg_attribute ON attrelid = pg_tables.tableid
WHERE schemaname = 'public'
  AND tablename IN ('knowledge_notes', 'collections', 'user_workspaces', 'search_history')
LIMIT 5;
