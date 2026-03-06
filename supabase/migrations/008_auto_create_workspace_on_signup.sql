-- Migration 008: Auto-create default workspace on user signup
-- Purpose: Server-side guarantee that every new user has a workspace in the DB,
--          independent of client-side state. Eliminates the race condition where
--          client-side migration runs with stale/wrong workspaces.
-- Date: Mar 2026

-- Function: creates a "Personal" workspace the moment auth.users gets a new row.
-- Uses SECURITY DEFINER so it can write to public.user_workspaces without RLS.
CREATE OR REPLACE FUNCTION public.handle_new_user_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_workspaces (
    id,
    user_id,
    name,
    icon,
    color,
    is_favorite,
    is_archived,
    search_count,
    created_at
  )
  VALUES (
    'ws_' || EXTRACT(EPOCH FROM now())::bigint || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 9),
    NEW.id,
    'Personal',
    '🏠',
    'teal',
    true,
    false,
    0,
    now()
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger: fires after every INSERT into auth.users (i.e., every new signup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_workspace();

-- Backfill: create workspaces for any existing users who still have none
-- (safe to run even after 007; uses a different ID format so no conflict)
INSERT INTO public.user_workspaces (id, user_id, name, icon, color, is_favorite, is_archived, search_count, created_at)
SELECT
  'ws_' || EXTRACT(EPOCH FROM now())::bigint || '_' || substr(replace(u.id::text, '-', ''), 1, 9),
  u.id,
  'Personal',
  '🏠',
  'teal',
  true,
  false,
  0,
  now()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_workspaces uw WHERE uw.user_id = u.id
)
ON CONFLICT DO NOTHING;

SELECT 'Migration 008 complete: trigger installed, backfill done' AS status;
