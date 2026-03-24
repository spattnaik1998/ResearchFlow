# ResearchFlow Database Security Guide

## Overview
This document outlines all security measures implemented in the ResearchFlow database and additional recommendations.

---

## ✅ Implemented Security Measures

### 1. Row Level Security (RLS) Policies
All tables have strict RLS policies that enforce user ownership:

| Table | Policy | Details |
|-------|--------|---------|
| `knowledge_notes` | User can only access own notes | Enforced via `user_id = auth.uid()` |
| `collections` | User can only access own collections | Enforced via `user_id = auth.uid()` |
| `note_tags` | Tied to user's own notes | Verified via JOIN to `knowledge_notes` |
| `note_links` | Both notes must belong to user | Verified via JOIN to `knowledge_notes` |
| `collection_notes` | Both collection and note must belong to user | Double verification required |
| `user_workspaces` | User can only access own workspaces | Enforced via `user_id = auth.uid()` |
| `search_history` | User can only access own history | Enforced via `user_id = auth.uid()` |
| `audit_log` | User can only view own audit logs | Enforced via `user_id = auth.uid()` |

### 2. NOT NULL Constraints
Critical user ownership columns are protected from NULL values:
```
- knowledge_notes.user_id (NOT NULL)
- collections.user_id (NOT NULL)
- user_workspaces.user_id (NOT NULL)
- search_history.user_id (NOT NULL)
```

### 3. Foreign Key Constraints
Data integrity is enforced through foreign keys:
```
- knowledge_notes → user_workspaces (CASCADE)
- collections → user_workspaces (CASCADE)
- search_history → user_workspaces (CASCADE)
- note_tags → knowledge_notes (CASCADE)
- note_links → knowledge_notes (CASCADE)
- collection_notes → collections (CASCADE) & knowledge_notes (CASCADE)
```

### 4. Unique Constraints
Prevent duplicate entries:
```
- user_workspaces(id, user_id) — Composite unique
- note_tags(note_id, tag) — Prevent duplicate tags
- note_links(from_note_id, to_note_id) — Prevent duplicate links
- collection_notes(collection_id, note_id) — PRIMARY KEY
```

### 5. Check Constraints
Data validation at database level:
```
- knowledge_notes.title — NOT empty (LENGTH > 0)
- user_workspaces.name — NOT empty (LENGTH > 0)
- collection_notes.position — Non-negative (>= 0)
- knowledge_notes.created_at — Not in future
- search_history.created_at — Not in future
```

### 6. Audit Logging
All critical operations are logged:
- **Tables audited**: `knowledge_notes`, `collections`
- **Operations logged**: INSERT, UPDATE, DELETE
- **Information captured**: User ID, operation type, before/after values, IP address, timestamp
- **RLS on audit_log**: Users can only view their own audit entries

### 7. Performance Indexes
Indexes optimize both performance AND security queries:
```
idx_knowledge_notes_user_id — User-scoped note queries
idx_knowledge_notes_user_workspace — User + workspace queries
idx_collections_user_workspace — User + workspace queries
idx_search_history_user_workspace — User + workspace queries
idx_user_workspaces_user_id — User workspace lookups
idx_audit_log_user_id — Audit trail lookups
```

### 8. Secure Views
Pre-filtered views that enforce RLS automatically:
```
user_notes_secure — Returns only authenticated user's notes with tags & links
user_workspaces_secure — Returns only authenticated user's workspaces
```

### 9. Quota & Rate Limiting Functions
Functions to prevent abuse:
```
can_create_note(user_id, workspace_id) — Check note creation quota
get_user_storage_usage(user_id) — Monitor user's storage consumption
```

---

## 🔐 Security Best Practices

### For API Routes
✅ Always use `getUser()` from `lib/auth-helpers.ts` to verify authentication
✅ Return 401 Unauthorized if `user` is null
✅ Pass `user.id` to all database queries for RLS enforcement

Example:
```typescript
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const data = await db
    .from('knowledge_notes')
    .select('*')
    .eq('user_id', user.id); // RLS will enforce this anyway

  return new Response(JSON.stringify(data));
}
```

### For Client Components
✅ Never trust user input for filtering — let RLS handle it
✅ Use `createSupabaseClient()` from `lib/supabase.ts`
✅ Assume RLS will reject unauthorized access

Example:
```typescript
const { data } = await supabase
  .from('knowledge_notes')
  .select('*')
  // RLS automatically filters to user's notes
  // No need to add .eq('user_id', user.id)
```

### For Data Migrations
✅ Always verify `user_id` is populated before migrating
✅ Use CASCADE delete carefully — only when intentional
✅ Test migrations on a staging database first

---

## 🛡️ Manual Security Checks

Run these queries in Supabase SQL Editor to verify security:

### 1. Check for orphaned records (should return 0)
```sql
-- Notes with NULL user_id
SELECT COUNT(*) FROM public.knowledge_notes WHERE user_id IS NULL;

-- Collections with NULL user_id
SELECT COUNT(*) FROM public.collections WHERE user_id IS NULL;

-- Workspaces with NULL user_id
SELECT COUNT(*) FROM public.user_workspaces WHERE user_id IS NULL;
```

### 2. Check for cross-user access vulnerabilities
```sql
-- Verify note_tags only belong to user's notes
SELECT COUNT(*) FROM public.note_tags nt
WHERE NOT EXISTS (
  SELECT 1 FROM public.knowledge_notes kn
  WHERE kn.id = nt.note_id
);

-- Verify note_links reference valid notes
SELECT COUNT(*) FROM public.note_links nl
WHERE NOT EXISTS (
  SELECT 1 FROM public.knowledge_notes kn
  WHERE kn.id = nl.from_note_id OR kn.id = nl.to_note_id
);

-- Verify collection_notes reference valid records
SELECT COUNT(*) FROM public.collection_notes cn
WHERE NOT EXISTS (
  SELECT 1 FROM public.collections c WHERE c.id = cn.collection_id
)
OR NOT EXISTS (
  SELECT 1 FROM public.knowledge_notes kn WHERE kn.id = cn.note_id
);
```

### 3. Check RLS policies are enabled
```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'knowledge_notes', 'collections', 'note_tags', 'note_links',
  'collection_notes', 'user_workspaces', 'search_history', 'audit_log'
);

-- Should return: rowsecurity = true for all tables
```

### 4. Verify constraint coverage
```sql
-- Find tables missing NOT NULL on user_id
SELECT
  c.table_name,
  c.column_name,
  c.is_nullable
FROM information_schema.columns c
WHERE c.table_schema = 'public'
AND c.column_name = 'user_id'
AND c.table_name IN (
  'knowledge_notes', 'collections', 'user_workspaces', 'search_history'
);

-- Should return: is_nullable = NO for all
```

### 5. Check index coverage
```sql
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'knowledge_notes', 'collections', 'search_history', 'audit_log'
)
ORDER BY tablename, indexname;
```

### 6. Monitor audit logs
```sql
-- Get recent activity for a user
SELECT
  user_id,
  table_name,
  operation,
  changed_at,
  new_values::text as summary
FROM public.audit_log
WHERE user_id = 'YOUR_USER_UUID_HERE'
ORDER BY changed_at DESC
LIMIT 50;
```

### 7. Check storage usage by user
```sql
-- Storage used per user
SELECT
  user_id,
  COUNT(*) as note_count,
  pg_size_pretty(
    SUM(
      LENGTH(COALESCE(title, '')) +
      LENGTH(COALESCE(content, '')) +
      COALESCE(pg_column_size(metadata), 0)
    )
  ) as total_size
FROM public.knowledge_notes
GROUP BY user_id
ORDER BY total_size DESC;
```

---

## 🚨 Security Incidents Response

### If you suspect unauthorized access:

1. **Check audit logs** for suspicious activity:
   ```sql
   SELECT * FROM public.audit_log
   WHERE changed_at > now() - interval '1 hour'
   ORDER BY changed_at DESC;
   ```

2. **Check RLS policies** are still enabled:
   ```sql
   ALTER TABLE public.knowledge_notes ENABLE ROW LEVEL SECURITY;
   ```

3. **Review user sessions** in Supabase Dashboard:
   - Go to Authentication → Users
   - Check last sign-in times and devices

4. **Force re-authentication**:
   - All Supabase sessions use short-lived JWT tokens (1 hour default)
   - Sessions are refreshed on each request
   - Force logout via: `supabase.auth.signOut()`

---

## 🔄 Maintenance Tasks

### Weekly
- [ ] Review audit logs for anomalies
- [ ] Monitor storage usage by user
- [ ] Check for failed database migrations

### Monthly
- [ ] Review and update RLS policies if needed
- [ ] Audit active user sessions
- [ ] Test disaster recovery procedures

### Quarterly
- [ ] Security audit of all API routes
- [ ] Review third-party dependencies for vulnerabilities
- [ ] Test backup and restore procedures

---

## 📚 References

### Supabase Security
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/postgres/security)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)

### OWASP
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html)

---

## ✨ Summary

ResearchFlow implements **multi-layered security**:
1. **Authentication** — Supabase JWT tokens
2. **Authorization** — Row Level Security (RLS) policies
3. **Data Integrity** — Foreign keys, constraints, triggers
4. **Audit Trail** — Complete activity logging
5. **Performance** — Optimized indexes for security queries
6. **Monitoring** — Audit logs and storage tracking

The combination ensures that even if one layer is compromised, others will prevent unauthorized access.
