-- Migration 007: Fix Multi-User Isolation & RLS
-- Purpose: Fix workspace sync failure, clear old 'default' workspace, fix orphaned notes, tighten RLS
-- Date: Feb 21, 2026

-- Step 1: Create missing workspaces for users who never got one
-- Generates unique workspace IDs to prevent cross-user collisions
INSERT INTO public.user_workspaces (id, user_id, name, icon, color, is_favorite, created_at)
SELECT
  'ws_default_' || replace(u.id::text, '-', '_'),
  u.id,
  'Personal',
  '🏠',
  'teal',
  true,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_workspaces uw WHERE uw.user_id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Re-point search_history rows with workspace_id='default' to the new workspace IDs
-- This handles the case where users already have history in the old 'default' workspace
UPDATE public.search_history sh
SET workspace_id = 'ws_default_' || replace(sh.user_id::text, '-', '_')
WHERE sh.workspace_id = 'default' AND sh.user_id IS NOT NULL;

-- Step 3: Assign orphaned knowledge_notes (user_id IS NULL) to workspace owners
-- This ensures all notes have a user_id that matches their workspace
UPDATE public.knowledge_notes kn
SET user_id = uw.user_id
FROM public.user_workspaces uw
WHERE kn.workspace_id = uw.id AND kn.user_id IS NULL;

-- Step 4: Remove the global 'default' workspace row (now replaced by user-specific rows)
DELETE FROM public.user_workspaces WHERE id = 'default';

-- Step 5: Add composite unique constraint to prevent future cross-user upsert conflicts
-- This ensures that (id, user_id) is unique across the table
ALTER TABLE public.user_workspaces
  ADD CONSTRAINT uq_user_workspaces_id_user UNIQUE (id, user_id);

-- Step 6: Tighten knowledge_notes RLS — remove OR user_id IS NULL escape hatch
DROP POLICY IF EXISTS "Users can view own notes" ON public.knowledge_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.knowledge_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.knowledge_notes;
DROP POLICY IF EXISTS "Admins can view all notes" ON public.knowledge_notes;

CREATE POLICY "Users can view own notes" ON public.knowledge_notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.knowledge_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.knowledge_notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.knowledge_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 7: Tighten note_tags RLS (same escape hatch removal)
DROP POLICY IF EXISTS "Users can view tags for own notes" ON public.note_tags;
DROP POLICY IF EXISTS "Users can create tags for own notes" ON public.note_tags;
DROP POLICY IF EXISTS "Users can delete tags for own notes" ON public.note_tags;

CREATE POLICY "Users can view tags for own notes" ON public.note_tags
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_notes
    WHERE id = note_tags.note_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create tags for own notes" ON public.note_tags
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.knowledge_notes
    WHERE id = note_tags.note_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tags for own notes" ON public.note_tags
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_notes
    WHERE id = note_tags.note_id AND user_id = auth.uid()
  ));

-- Step 8: Replace blanket USING(true) policies on collections, collection_notes, note_links
DROP POLICY IF EXISTS "Allow all operations on collections" ON public.collections;
DROP POLICY IF EXISTS "Allow all operations on collection_notes" ON public.collection_notes;
DROP POLICY IF EXISTS "Allow all operations on note_links" ON public.note_links;

CREATE POLICY "Users can manage own collections" ON public.collections
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage collection_notes for own collections" ON public.collection_notes
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.collections
    WHERE id = collection_notes.collection_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.collections
    WHERE id = collection_notes.collection_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage note_links for own notes" ON public.note_links
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_notes
    WHERE id = note_links.from_note_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.knowledge_notes
    WHERE id = note_links.from_note_id AND user_id = auth.uid()
  ));

-- Success confirmation
SELECT 'Multi-user isolation fixed successfully' as status;
