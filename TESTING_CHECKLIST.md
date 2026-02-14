# Knowledge Base Testing Checklist

## ✅ COMPLETED: Automated Checks

### Step 1: Dev Server ✅
```
✓ Server started successfully at http://localhost:3000
✓ Ready in 2.4s
✓ All environment variables loaded from .env.local
✓ Supabase configured:
  - NEXT_PUBLIC_SUPABASE_URL=https://drmjnnvqujnmhdfkcler.supabase.co
  - NEXT_PUBLIC_SUPABASE_ANON_KEY configured
```

### Step 5: Pre-Production Verification ✅
```
✓ npm run build     → Success (2.9s, no errors)
✓ npx tsc --noEmit → No TypeScript errors
✓ npm run lint      → No ESLint warnings/errors
✓ All API routes compiled:
  - /api/questions
  - /api/search
  - /api/summarize
✓ All Knowledge Base pages compiled:
  - /knowledge (library)
  - /knowledge/new (create note)
  - /knowledge/[noteId] (edit note)
```

---

## 📋 TODO: Manual Browser Testing

**Dev server is running at: http://localhost:3000**

### Test 1: Save Search to Knowledge Base
**Steps:**
1. Open http://localhost:3000
2. Enter search query: "React hooks tutorial"
3. Wait for results to load
4. Wait for summary to generate
5. Look for 💡 **Save to Knowledge** button
6. Click it
7. **Expected:** Toast notification appears (✅ Saved to knowledge base)

**Verification:**
- Check browser console for errors
- Note should appear in `/knowledge` page
- Supabase Table Editor should show new row

---

### Test 2: Open Knowledge Base
**Steps:**
1. Press `Cmd+B` (or `Ctrl+Shift+B` on Windows) OR click 📚 icon in sidebar
2. Modal/page should open
3. Should show "1 note in this workspace"

**Expected Results:**
- Knowledge Base opens without errors
- Note card displays with:
  - Title: "React hooks tutorial"
  - Preview text
  - Creation date
  - Tags (if any)

---

### Test 3: Real-Time Search in Notes
**Steps:**
1. In Knowledge Base, find the search box
2. Type "hooks" → note should stay visible
3. Type "xyz" → note should disappear
4. Clear search → note should reappear
5. Try "react" → note visible

**Expected Results:**
- ✅ Case-insensitive search works
- ✅ Real-time filtering (no delay)
- ✅ Preview text searched correctly

---

### Test 4: Edit Existing Note
**Steps:**
1. Click the "React hooks tutorial" note card
2. Navigate to `/knowledge/[noteId]` edit page
3. Change title to: "React Hooks - Complete Guide"
4. Add content in editor:
   ```
   ## Key Concepts
   - useState
   - useEffect
   - Custom hooks

   ## My Notes
   Remember to use hooks at top level
   ```
5. Add tags: "react", "frontend", "javascript"
6. Click Save

**Expected Results:**
- ✅ Editor loads the note content
- ✅ Markdown preview works
- ✅ Tags are properly added
- ✅ Saves and redirects to library
- ✅ Updated title/content appear in library view

---

### Test 5: Tag Filtering
**Steps:**
1. Back in Knowledge Base library
2. Look for tag pills: "All (1)", "react (1)", "frontend (1)"
3. Click "react" tag
4. Should still show the note (filtered by tag)
5. Click "All" to reset
6. Click "xyz" (non-existent tag) - should show 0 notes

**Expected Results:**
- ✅ Tag pills display correctly
- ✅ Clicking tag filters notes
- ✅ "All" resets filter
- ✅ Non-existent tags handled gracefully

---

### Test 6: Create New Note Manually
**Steps:**
1. Click ➕ **New** button in Knowledge Base
2. Navigate to `/knowledge/new`
3. Enter title: "Test Manual Note"
4. Enter content:
   ```
   # Markdown Test

   This is **bold** and *italic*.

   - List item 1
   - List item 2
   - List item 3
   ```
5. Add tags: "test", "markdown"
6. Click Save

**Expected Results:**
- ✅ New page loads cleanly
- ✅ Markdown editor is functional
- ✅ Tags input works
- ✅ Note saves to database
- ✅ Library now shows "2 notes"
- ✅ New note appears in list

---

### Test 7: Delete Note
**Steps:**
1. In Knowledge Base library, hover over "Test Manual Note"
2. Click the delete/trash ✕ button
3. Confirm deletion (if prompted)
4. Check that note is removed

**Expected Results:**
- ✅ Hover shows delete button
- ✅ Note removed from UI
- ✅ Note removed from Supabase
- ✅ Library shows "1 note" again

---

### Test 8: Workspace Isolation
**Steps:**
1. Open Command Palette: `Cmd+K` (Windows: `Ctrl+K`)
2. Search "Create workspace"
3. Create new workspace: "Test Workspace"
4. Switch to it
5. Open Knowledge Base (`Cmd+B`)
6. Should show "0 notes in this workspace"
7. Create a new note: "Workspace B Note"
8. Switch back to original workspace
9. Open Knowledge Base

**Expected Results:**
- ✅ New workspace has empty KB
- ✅ Can create new note in new workspace
- ✅ Switching back shows original note only
- ✅ **NO DATA LEAKAGE** between workspaces

---

### Test 9: Dark Mode Compatibility
**Steps:**
1. Press `Cmd+/` (Windows: `Ctrl+/`) to toggle dark mode
2. Switch to dark mode
3. Open Knowledge Base (`Cmd+B`)
4. Click a note to open editor
5. All text should be readable
6. Preview should work in both modes

**Expected Results:**
- ✅ Dark mode doesn't break KB components
- ✅ Proper contrast on text
- ✅ Markdown preview renders correctly in dark mode
- ✅ Switch back to light mode - everything works

---

### Test 10: Markdown Rendering in Preview
**Steps:**
1. Edit a note with markdown:
   ```markdown
   # Heading 1
   ## Heading 2

   **Bold text** and *italic text*

   - Item 1
   - Item 2

   `inline code`

   ```javascript
   // code block
   const x = 10;
   ```

   [Link](https://example.com)
   ```
2. Switch to Preview tab (👁️ icon)

**Expected Results:**
- ✅ Headings render with correct sizes
- ✅ Bold/italic work
- ✅ Lists format correctly
- ✅ Code blocks have syntax highlighting
- ✅ Links are clickable
- ✅ No HTML escaping issues

---

## 🚀 Performance Testing

### Test: Load Time with Multiple Notes
**Steps:**
1. Create 10-15 additional notes via "Save to Knowledge" from various searches:
   - "machine learning basics"
   - "javascript async/await"
   - "CSS flexbox guide"
   - "Docker containerization"
   - etc.
2. Open Knowledge Base
3. **Time how long it takes to load all notes**
4. Search for "javascript" - should be instant
5. Filter by tag - should be responsive

**Expected Results:**
- ✅ Library loads in < 1 second
- ✅ Search is instant (< 100ms)
- ✅ No visual lag when scrolling
- ✅ No memory leaks (check DevTools → Memory tab)

---

## 🗄️ Data Verification in Supabase

### Manual Checks in Supabase Dashboard

1. **Go to:** https://supabase.com/dashboard → Select "voicesearch-testing" project

2. **Check Table Editor:**
   - Click `knowledge_notes` table
   - Verify you see all notes you created
   - Each row should have:
     - `id` (UUID)
     - `workspace_id` (should match current workspace)
     - `title` (your note titles)
     - `content` (markdown content)
     - `created_at` (timestamp)
     - `metadata` (JSON: keyPoints, questions)

3. **Check `note_tags` table:**
   - Each tag should link to a note via `note_id`
   - Tags should be lowercase and normalized
   - No orphaned tags without `note_id`

4. **Run SQL Query** (SQL Editor):
   ```sql
   SELECT
     kn.title,
     kn.workspace_id,
     kn.created_at,
     array_agg(nt.tag) as tags
   FROM knowledge_notes kn
   LEFT JOIN note_tags nt ON kn.id = nt.note_id
   GROUP BY kn.id, kn.title, kn.workspace_id, kn.created_at
   ORDER BY kn.created_at DESC;
   ```

   **Expected Results:**
   - All notes appear in results
   - Tags properly grouped
   - No NULL values in required fields
   - Workspace IDs are consistent

---

## 📊 Summary Table

| Test | Status | Pass/Fail | Notes |
|------|--------|-----------|-------|
| 1. Save search to KB | Pending | — | |
| 2. Open Knowledge Base | Pending | — | |
| 3. Search notes (real-time) | Pending | — | |
| 4. Edit existing note | Pending | — | |
| 5. Tag filtering | Pending | — | |
| 6. Create new note | Pending | — | |
| 7. Delete note | Pending | — | |
| 8. Workspace isolation | Pending | — | |
| 9. Dark mode | Pending | — | |
| 10. Markdown rendering | Pending | — | |
| Performance (15 notes) | Pending | — | |
| Supabase data integrity | Pending | — | |

---

## 🐛 Troubleshooting

### "Supabase not configured" error
- Check browser console for specific error
- Verify `.env.local` has real values (not placeholders)
- Verify Supabase project is "Active" in dashboard
- Restart dev server: `Ctrl+C` → `npm run dev`

### Notes not saving
- Check Supabase project status in dashboard
- Open DevTools → Network tab → check API response
- Check browser console for fetch errors
- Verify `/api/knowledge/*` routes are working

### Search not working
- Check browser console for errors
- Verify `knowledge_notes` table has data in Supabase
- Try refreshing the page

### Dark mode issues
- Check browser console for CSS errors
- Clear browser cache: `Ctrl+Shift+Delete`
- Verify dark mode toggle works in main UI first

---

## ✅ Success Criteria

All tests must pass:
- ✅ 10 feature tests completed
- ✅ Performance acceptable (< 1s load, < 100ms search)
- ✅ Data verified in Supabase
- ✅ No console errors
- ✅ Build, lint, TypeScript all pass
- ✅ Workspace isolation working

**When complete:** Ready for production deployment

---

## 🎯 Next Steps

1. **Run all 10 manual tests above** (20-30 min)
2. **Verify Supabase data** (5 min)
3. **Create 15 test notes** and verify performance (10 min)
4. **Update summary table** with results
5. **Report any issues** - they'll be fixed before production

**Status:** 🟢 Automated checks passed. Awaiting manual testing.
