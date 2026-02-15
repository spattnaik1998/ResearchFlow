# Knowledge Base Setup Guide

## Overview

The Knowledge Base feature allows you to save searches as permanent notes, organize them with tags, and build a personal knowledge repository. This guide walks you through setting up and using the Knowledge Base system.

## Architecture

The Knowledge Base system includes:

- **Frontend Components**: Note editor, library view, note cards
- **Backend Storage**: Supabase PostgreSQL database
- **Features**: Full-text search, tagging, markdown editing, workspace isolation

## Database Setup

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - **Project Name**: ResearchFlow Knowledge Base
   - **Password**: Generate a strong password
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is sufficient for getting started

4. Wait for project creation (1-2 minutes)

### 2. Create Database Tables

1. Go to your project's **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL schema from `supabase/migrations/001_knowledge_base_schema.sql`
4. Click **Run**

The schema creates these tables:
- `knowledge_notes` - Stores notes with content and metadata
- `note_tags` - Maps tags to notes for categorization
- `note_links` - Enables bidirectional linking between notes (for future use)
- `collections` - Organizes notes into groups (for future use)

### 3. Get API Credentials

1. Go to **Project Settings** > **API**
2. Copy these values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** secret → `SUPABASE_SERVICE_KEY` (for future server-side operations)

Example:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Usage

### Saving a Search to Knowledge Base

1. Perform any search on ResearchFlow
2. Wait for AI summary and related questions to generate
3. Click the **💡** button in the top right
4. Note is automatically saved with:
   - Title from your search query
   - Content with summary, key points, and questions
   - Metadata preserved for future reference

### Accessing the Knowledge Base

**Method 1: Knowledge Button**
- Click the **📚** button in the top navigation bar

**Method 2: Keyboard Shortcut**
- Press `Cmd+B` (Mac) or `Ctrl+B` (Windows/Linux)

**Method 3: Command Palette**
- Press `Cmd+K` (or `Ctrl+K`) to open Command Palette
- Type "Knowledge Base" or "Knowledge"

### Creating and Editing Notes

#### New Note
1. Click **➕ New** button in Knowledge Base
2. Enter title and content in markdown
3. Add tags (optional)
4. Click **Save Note**

#### Edit Existing Note
1. Open Knowledge Base
2. Click on any note card
3. Modify title, content, or tags
4. Click **Save Note**

#### Delete Note
1. Open note or hover over card in library
2. Click **🗑️** button
3. Confirm deletion

### Organizing with Tags

Tags help categorize and find notes quickly.

**Adding Tags:**
- Type tag name in the tag input field
- Press Enter or click Add
- Tags are case-insensitive and normalized

**Filtering by Tags:**
- In Knowledge Base view, click any tag button to filter
- Click "All" to clear filter
- Tag count shows how many notes have each tag

**Auto-Tags (Coming Soon):**
- Notes from searches will suggest relevant tags based on content

### Search and Discovery

**Full-Text Search:**
- Type in the search box to find notes by title or content
- Matches any part of the text (case-insensitive)
- Real-time as you type

**Tag-Based Filtering:**
- Click tag pills to filter notes
- Combine with search for more specific results
- View count shows matching notes

**Workspace Isolation:**
- Notes are isolated per workspace
- Switch workspaces to see only relevant notes
- Useful for separating work, personal, research

## Features

### Completed Features (Phase 1)

- ✅ Save searches as notes with metadata
- ✅ Markdown content editing with live preview
- ✅ Full-text search across all notes
- ✅ Tag management and filtering
- ✅ Workspace-aware note isolation
- ✅ Persistent storage in Supabase
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Keyboard shortcuts (Cmd+B)
- ✅ Command palette integration

### Planned Features (Phase 2+)

- 📋 **Collections**: Organize notes into custom groups
- 🔗 **Bidirectional Linking**: Link related notes with `[[wikilinks]]`
- 📊 **Knowledge Graph**: Visualize note relationships
- 🔄 **Spaced Repetition**: SM-2 algorithm for review scheduling
- 🔍 **Semantic Search**: AI-powered search using embeddings
- 📤 **Export**: Download notes as PDF, Markdown, or HTML
- 👥 **Collaboration**: Share notes with other users (requires auth)
- 📱 **PWA**: Offline mode and installable app

## Data Model

### knowledge_notes

Stores the core note data:

```typescript
{
  id: UUID,
  workspace_id: string,        // Workspace this note belongs to
  title: string,               // Note title
  content: string,             // Markdown content
  search_query: string,        // Original search that created this
  source_searches: string[],   // Links to original searches
  created_at: timestamp,
  updated_at: timestamp,
  last_reviewed_at: timestamp, // For spaced repetition
  metadata: {
    originalSummary?: string,  // From AI summary
    keyPoints?: string[],      // Extracted points
    questions?: string[]       // Related questions
  }
}
```

### note_tags

Maps notes to tags for categorization:

```typescript
{
  id: UUID,
  note_id: UUID,      // Reference to knowledge_notes
  tag: string,        // Tag name (normalized to lowercase)
  created_at: timestamp
}
```

### Other Tables (Future Use)

- `note_links` - Bidirectional links between notes
- `collections` - Organize notes into custom groups
- `collection_notes` - Join table for collections

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+B` / `Ctrl+B` | Open Knowledge Base |
| `Cmd+K` / `Ctrl+K` | Open Command Palette (then search "knowledge") |
| `Tab` | Navigate through note input fields |
| `Escape` | Close modal or cancel edit |

## Troubleshooting

### "Supabase not configured" message

**Cause**: Environment variables not set

**Solution**:
1. Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Restart dev server: `npm run dev`
3. Clear browser cache
4. Check Supabase dashboard that project is active

### Notes not saving

**Causes & Solutions**:
- Network error: Check internet connection
- Invalid Supabase key: Verify keys in `.env.local`
- Database error: Check Supabase logs for SQL errors
- Browser console: Open F12, check for JavaScript errors

### Search not finding notes

**Causes & Solutions**:
- Search is case-insensitive but exact substring match
- Check that note content includes search term
- Try searching by title instead of content
- Clear tag filters to broaden search

### Tags not appearing

**Causes & Solutions**:
- Tags require Supabase to be connected
- Tag input is case-insensitive (normalized to lowercase)
- Duplicate tags are merged automatically
- Check database has note_tags table

## Performance Tips

### Optimize for large note libraries

- Use tags to organize instead of large unstructured notes
- Archive old notes if not needed (coming in Phase 2)
- Keep note content under 10,000 characters for snappy performance
- Use specific tags for faster filtering

### Database maintenance

- Supabase provides 500MB free storage (plenty for thousands of notes)
- Backup database regularly through Supabase dashboard
- Monitor API usage to avoid rate limits

## Security & Privacy

### Current Security Model (Phase 1)

- **Row-Level Security (RLS)**: Currently allows all operations
- **No Authentication**: Notes visible to anyone with database access
- **Client-Side Only**: No backend user tracking

### Future Security (Phase 2+)

- **User Authentication**: Supabase Auth integration
- **Row-Level Security Policies**: Restrict notes to authenticated users
- **Rate Limiting**: Prevent abuse
- **Encryption**: Sensitive content at rest and in transit

## Development

### Adding the Knowledge Base to Your Project

If you forked without Knowledge Base:

1. Add dependencies:
   ```bash
   npm install @supabase/supabase-js react-markdown remark-gfm
   ```

2. Copy files:
   ```
   lib/supabase.ts
   lib/knowledge-db.ts
   components/knowledge/
   app/knowledge/
   ```

3. Update `app/page.tsx` with `NotesLibrary` import and button

4. Update `types/index.ts` with Knowledge Base types

5. Update keyboard shortcuts in `lib/hooks/useKeyboardShortcuts.ts`

### Extending the Knowledge Base

**Add New Features**:
1. Modify database schema (add columns to knowledge_notes)
2. Update TypeScript types
3. Create new React components
4. Add API routes if needed

**Example: Adding a "favorite" flag**:
```sql
ALTER TABLE knowledge_notes ADD COLUMN is_favorite BOOLEAN DEFAULT false;
```

## API Reference

### knowledgeDB.createNote(note)
Create a new note.

```typescript
const note = await knowledgeDB.createNote({
  workspace_id: 'default',
  title: 'My Note',
  content: '# Title\n\nContent here'
});
```

### knowledgeDB.getNotes(workspaceId)
Fetch all notes in a workspace.

```typescript
const notes = await knowledgeDB.getNotes('default');
```

### knowledgeDB.getNote(id)
Fetch a single note by ID.

```typescript
const note = await knowledgeDB.getNote('note-uuid');
```

### knowledgeDB.updateNote(id, updates)
Update a note's title, content, or metadata.

```typescript
await knowledgeDB.updateNote('note-uuid', {
  title: 'Updated Title',
  content: 'Updated content'
});
```

### knowledgeDB.deleteNote(id)
Delete a note (permanent).

```typescript
await knowledgeDB.deleteNote('note-uuid');
```

### knowledgeDB.addTag(noteId, tag)
Add a tag to a note.

```typescript
await knowledgeDB.addTag('note-uuid', 'important');
```

### knowledgeDB.getNoteTags(noteId)
Get all tags for a note.

```typescript
const tags = await knowledgeDB.getNoteTags('note-uuid');
// ['important', 'research']
```

### knowledgeDB.removeTag(noteId, tag)
Remove a tag from a note.

```typescript
await knowledgeDB.removeTag('note-uuid', 'important');
```

### knowledgeDB.searchNotes(workspaceId, query)
Full-text search for notes.

```typescript
const results = await knowledgeDB.searchNotes('default', 'machine learning');
```

### knowledgeDB.searchNotesByTag(workspaceId, tag)
Find all notes with a specific tag.

```typescript
const notes = await knowledgeDB.searchNotesByTag('default', 'important');
```

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [GitHub Issues](https://github.com/anthropics/claude-code/issues)
3. Check Supabase documentation: https://supabase.com/docs
4. Post in community discussions

## Changelog

### v1.0.0 (Phase 1) - Feb 2026

**Initial Release**
- Note creation and editing
- Full-text search
- Tag management
- Workspace isolation
- Dark mode support
- Keyboard shortcuts
- Markdown support with live preview

**Future Releases**
- Phase 2: Collections, bidirectional linking, knowledge graph
- Phase 3: Semantic search, spaced repetition, user authentication
