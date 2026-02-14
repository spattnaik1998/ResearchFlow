# ⚡ Quick Testing Guide - 55 Minutes

**Server:** http://localhost:3005
**DevTools:** Keep F12 open
**Total Time:** ~55 minutes for all 10 tests

---

## 🚀 Test 1: Core Search Workflow (5 min)

```
1. Type: "artificial intelligence"
2. See: Results appear (Stage 2)
3. See: Summary appears (Stage 3)
4. See: Questions appear (Stage 4)
5. Click: Any question
6. See: New search starts

✅ Success: All 4 stages work, questions clickable
```

---

## 📜 Test 2: Search History Eager Loading (3 min)

```
1. Do 3-5 searches
2. Close tab completely
3. Reopen http://localhost:3005
4. Look at header (without opening sidebar)
5. See: "3 searches" badge immediately

✅ Success: Badge appears instantly (not delayed)
```

---

## ⚡ Test 3: localStorage Debouncing (5 min)

```
1. F12 → Performance tab
2. Record (big circle button)
3. Do 5 searches very fast (2 seconds)
4. Stop recording
5. Look at timeline
6. Count: localStorage.setItem calls

✅ Success: See only 1-2 calls (not 5)
```

---

## 💾 Test 4: Page Unload Flush (3 min)

```
1. Do 2-3 searches
2. Immediately close tab (don't wait)
3. Reopen http://localhost:3005
4. Open history sidebar
5. See: All searches saved

✅ Success: No searches lost
```

---

## 🧠 Test 5: Memory Cleanup (3 min)

```
1. F12 → Memory tab
2. Camera icon → Snapshot (remember value)
3. Do 10 searches quickly
4. Wait 5 seconds
5. Camera icon → Snapshot (compare value)

✅ Success: Heap is roughly same size (±2 MB)
```

---

## 💾 Test 6: Knowledge Base CRUD (10 min)

### Save
```
1. Search: "quantum computing"
2. Wait for summary
3. Click: "💾 Save to Knowledge"
4. Title: "Quantum Computing Basics"
5. Tags: "physics, technology"
6. Click: Save

✅ Success: Toast says "Note saved successfully"
```

### Search
```
1. Click: "📚 Knowledge" button
2. Type: "quantum"
3. See: Note appears

✅ Success: Note visible in results
```

### Edit
```
1. Click: The note
2. Change: Title or tags
3. Click: "Save Changes"
4. Refresh page

✅ Success: Changes persisted
```

### Delete
```
1. Click: "Delete Note"
2. Confirm deletion

✅ Success: Note gone from library
```

---

## 🏢 Test 7: Workspace Isolation (5 min)

```
1. Click: Workspace dropdown
2. Create: "Testing Workspace"
3. Do 2 searches in new workspace
4. Save 1 note
5. Switch back to "Personal"
6. Open history sidebar + Knowledge

✅ Success: Only Personal searches/notes visible
```

---

## 🌙 Test 8: Dark Mode (3 min)

```
1. Click: Moon icon (top right)
2. Look at: Homepage, Results, History, Knowledge
3. Click: Moon again (back to light)

✅ Success: Smooth transition, all readable
```

---

## ⚠️ Test 9: Error Handling (5 min)

```
1. Edit .env.local
2. Change: OPENAI_API_KEY to "invalid_key"
3. Restart dev server: npm run dev
4. Do a search
5. Wait for summary stage

✅ Success: Error message clear, can still interact
```

---

## 🔍 Test 10: Console Check (2 min)

```
Keep F12 Console open during all tests
Look for: Red errors (⚠️ OK, ❌ Bad)
         Yellow warnings (⚠️ OK if not hydration)
         Unhandled rejections (❌ Bad)

✅ Success: No red errors, no rejections
```

---

## 📊 Record Results

```
[✓ or ✗] Test 1  - Core Search
[✓ or ✗] Test 2  - History Loading
[✓ or ✗] Test 3  - Debouncing
[✓ or ✗] Test 4  - Unload Flush
[✓ or ✗] Test 5  - Memory
[✓ or ✗] Test 6  - Knowledge Base
[✓ or ✗] Test 7  - Workspace
[✓ or ✗] Test 8  - Dark Mode
[✓ or ✗] Test 9  - Error Handling
[✓ or ✗] Test 10 - Console

Total: __/10 passing
Status: [ ] Ready [ ] Needs Fixes [ ] Critical Issues
```

---

## 🆘 Quick Troubleshooting

**Search not working?**
- Check: .env.local has OPENAI_API_KEY and SERPER_API_KEY
- Check: F12 Console for errors
- Fix: Restart server with `npm run dev`

**History not loading?**
- Try: `localStorage.clear()` in console
- Try: Refresh page
- Try: Close and reopen browser tab

**Notes not saving?**
- Check: SUPABASE_URL and SUPABASE_ANON_KEY in .env.local
- Check: F12 Network tab for failed POST
- Check: Supabase dashboard for table creation

**Heap not returning to baseline?**
- Try: Refresh page and take snapshot again
- Check: No infinite loops in code
- Look: Detached DOM nodes in Memory tab

---

## ⏰ Time Breakdown

```
Test 1:  5 min  |████
Test 2:  3 min  |███
Test 3:  5 min  |████
Test 4:  3 min  |███
Test 5:  3 min  |███
Test 6: 10 min  |██████████
Test 7:  5 min  |████
Test 8:  3 min  |███
Test 9:  5 min  |████
Test 10: 2 min  |██
─────────────────────
Total: 44 min   (+ 11 min buffer = 55 min)
```

---

## 🎯 Success = Production Ready

If all 10 tests pass:
```
✅ Phase 4 COMPLETE
✅ Ready for Phase 5-8
✅ Ready to deploy
```

If any test fails:
```
📝 Note the failure
🔍 Check troubleshooting above
🔄 Fix and re-test
📞 Or run full debugging (see DEBUGGING_RUN_FINAL_STATUS.md)
```

---

**Start:** http://localhost:3005
**Time:** ~55 minutes
**Goal:** All 10 tests PASS ✅
