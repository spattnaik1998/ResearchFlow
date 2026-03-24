# Security Migration Deployment Guide

## Quick Start

### 1. Review the Migration
Before deploying, review `009_comprehensive_security_hardening.sql`:
```bash
cat supabase/migrations/009_comprehensive_security_hardening.sql
```

### 2. Deploy to Development First
✅ **Always test on dev/staging before production**

In Supabase Dashboard:
1. Go to **SQL Editor**
2. Copy the contents of `supabase/migrations/009_comprehensive_security_hardening.sql`
3. Paste into the SQL Editor
4. Click **Run** (or press Cmd+Enter)
5. Verify: No errors appear in the output panel

### 3. Verify Migration Success

After running the migration, execute the verification queries below:

```sql
-- ✅ Verify NOT NULL constraints
SELECT
  tablename,
  attname,
  NOT attnotnull as has_null
FROM pg_tables t
JOIN pg_attribute a ON a.attrelid = t.tableoid
WHERE schemaname = 'public'
  AND tablename IN ('knowledge_notes', 'collections', 'user_workspaces', 'search_history')
  AND attname = 'user_id'
AND NOT attnotnull; -- Should return 0 rows

-- ✅ Verify RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('knowledge_notes', 'collections', 'note_tags', 'note_links', 'collection_notes', 'user_workspaces', 'search_history', 'audit_log')
ORDER BY tablename;
-- All should show rowsecurity = true

-- ✅ Verify audit_log table exists
SELECT COUNT(*) as count FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'audit_log';
-- Should return: count = 1

-- ✅ Verify audit triggers exist
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'audit_%'
ORDER BY event_object_table;
-- Should show: audit_knowledge_notes_trigger, audit_collections_trigger
```

### 4. Deploy to Production

Once verified on development:

1. **Backup production database** (Supabase Dashboard → Backups)
2. **Run migration on production** (same process as step 2)
3. **Run verification queries** (step 3) on production
4. **Monitor audit logs** for any issues in first 24 hours

```sql
-- Monitor recent audit activity
SELECT
  user_id,
  table_name,
  operation,
  COUNT(*) as operation_count,
  MAX(changed_at) as latest
FROM public.audit_log
WHERE changed_at > now() - interval '24 hours'
GROUP BY user_id, table_name, operation
ORDER BY latest DESC;
```

---

## Migration Details

### What This Migration Does

**Phase 1: Data Integrity**
- Adds NOT NULL constraints to all `user_id` columns
- Ensures no orphaned records exist

**Phase 2: Foreign Keys**
- Links notes/collections/history to valid workspaces
- Cascades deletes to maintain referential integrity

**Phase 3: Indexes**
- Adds composite indexes for common queries
- Improves both security query performance and safety

**Phase 4: Constraints**
- Prevents empty titles and workspace names
- Prevents invalid timestamps and positions

**Phase 5: RLS Enforcement**
- Tightens `note_links` policies (both notes must belong to user)
- Tightens `collection_notes` policies (both collection and note must belong to user)

**Phase 6: Audit Logging**
- Creates `audit_log` table to track all changes
- Installs triggers to automatically log INSERT/UPDATE/DELETE
- Logs user ID, operation, old/new values, IP address, timestamp

**Phase 7: Secure Views**
- `user_notes_secure` — User's notes with metadata
- `user_workspaces_secure` — User's workspaces

**Phase 8: Quota Functions**
- `can_create_note()` — Prevents exceeding note limit
- `get_user_storage_usage()` — Monitors storage consumption

---

## Rollback Procedure (if needed)

If you need to rollback, you must delete the migration manually:

```sql
-- Remove audit triggers
DROP TRIGGER IF EXISTS audit_knowledge_notes_trigger ON public.knowledge_notes;
DROP TRIGGER IF EXISTS audit_collections_trigger ON public.collections;

-- Remove audit functions
DROP FUNCTION IF EXISTS public.audit_knowledge_notes();
DROP FUNCTION IF EXISTS public.audit_collections();

-- Remove quota functions
DROP FUNCTION IF EXISTS public.can_create_note(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_user_storage_usage(UUID);

-- Drop views
DROP VIEW IF EXISTS public.user_notes_secure;
DROP VIEW IF EXISTS public.user_workspaces_secure;

-- Drop audit_log table
DROP TABLE IF EXISTS public.audit_log;

-- Remove indexes
DROP INDEX IF EXISTS idx_knowledge_notes_user_workspace;
DROP INDEX IF EXISTS idx_collections_user_workspace;
DROP INDEX IF EXISTS idx_search_history_user_workspace;
DROP INDEX IF EXISTS idx_user_workspaces_user_id;
DROP INDEX IF EXISTS idx_search_history_created_at;
DROP INDEX IF EXISTS idx_note_tags_user_tag;

-- Remove foreign keys
ALTER TABLE public.knowledge_notes DROP CONSTRAINT IF EXISTS fk_knowledge_notes_workspace;
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS fk_collections_workspace;
ALTER TABLE public.search_history DROP CONSTRAINT IF EXISTS fk_search_history_workspace;

-- Remove check constraints
ALTER TABLE public.knowledge_notes DROP CONSTRAINT IF EXISTS chk_knowledge_notes_title_not_empty;
ALTER TABLE public.knowledge_notes DROP CONSTRAINT IF EXISTS chk_knowledge_notes_created_at_not_future;
ALTER TABLE public.user_workspaces DROP CONSTRAINT IF EXISTS chk_user_workspaces_name_not_empty;
ALTER TABLE public.collection_notes DROP CONSTRAINT IF EXISTS chk_collection_notes_position_non_negative;
ALTER TABLE public.search_history DROP CONSTRAINT IF EXISTS chk_search_history_created_at_not_future;

-- Remove NOT NULL constraints (make columns nullable again)
ALTER TABLE public.knowledge_notes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.collections ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.user_workspaces ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.search_history ALTER COLUMN user_id DROP NOT NULL;

-- Restore original RLS policies
CREATE POLICY "Allow all operations on note_links" ON public.note_links
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on collection_notes" ON public.collection_notes
  FOR ALL USING (true) WITH CHECK (true);
```

---

## Post-Deployment Monitoring

### Day 1: Active Monitoring
- [ ] Monitor audit logs for errors
- [ ] Test note creation/update/deletion
- [ ] Test collection operations
- [ ] Verify no application errors in logs

### Week 1: Validation
- [ ] Run all verification queries
- [ ] Check storage usage trends
- [ ] Review audit logs for patterns
- [ ] Test API endpoints with different users

### Ongoing: Maintenance
- [ ] Monthly: Review audit logs for anomalies
- [ ] Monthly: Monitor storage quotas
- [ ] Quarterly: Review and test disaster recovery

---

## Troubleshooting

### Issue: "user_id IS NULL" constraint violation

**Cause**: Records exist with NULL user_id (orphaned records)

**Solution**:
```sql
-- Find orphaned records
SELECT 'knowledge_notes' as table_name, id FROM public.knowledge_notes WHERE user_id IS NULL
UNION
SELECT 'collections', id FROM public.collections WHERE user_id IS NULL;

-- Delete them (if safe)
DELETE FROM public.knowledge_notes WHERE user_id IS NULL;
DELETE FROM public.collections WHERE user_id IS NULL;

-- Then retry migration
```

### Issue: "Foreign key constraint violation"

**Cause**: Records reference non-existent workspaces

**Solution**:
```sql
-- Find broken references
SELECT id, workspace_id, user_id FROM public.knowledge_notes kn
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_workspaces uw
  WHERE uw.id = kn.workspace_id AND uw.user_id = kn.user_id
);

-- Fix: Move notes to user's default workspace
UPDATE public.knowledge_notes kn
SET workspace_id = (
  SELECT id FROM public.user_workspaces
  WHERE user_id = kn.user_id
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_workspaces uw
  WHERE uw.id = kn.workspace_id AND uw.user_id = kn.user_id
);

-- Then retry migration
```

### Issue: Performance degradation after migration

**Cause**: Indexes need to build or triggers are slow

**Solution**:
```sql
-- Check index size and usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_size,
  idx_scan
FROM (
  SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as idx_size,
    idx_scan
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
) indexes
ORDER BY idx_size DESC;

-- Analyze tables
ANALYZE public.knowledge_notes;
ANALYZE public.collections;

-- Check slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE query LIKE '%knowledge_notes%'
ORDER BY mean_time DESC;
```

---

## Questions?

See `SECURITY.md` for detailed documentation of all security features.
