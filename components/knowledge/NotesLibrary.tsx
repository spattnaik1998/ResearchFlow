'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { knowledgeDB } from '@/lib/knowledge-db';
import type { KnowledgeNote } from '@/types';
import { NoteCard } from './NoteCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';

interface NotesLibraryProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function NotesLibrary({ isOpen = true, onClose }: NotesLibraryProps) {
  const [notes, setNotes] = useState<KnowledgeNote[]>([]);
  const [noteTags, setNoteTags] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { activeWorkspaceId } = useWorkspaceStore();
  const router = useRouter();

  const workspaceId = activeWorkspaceId || '';

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Single query fetches notes + tags together (eliminates N+1 round-trips)
      const data = await knowledgeDB.getNotesWithTags(workspaceId);
      const tagsMap = new Map<string, string[]>();
      data.forEach((note) => {
        tagsMap.set(note.id, (note.note_tags ?? []).map((t) => t.tag));
      });
      setNotes(data);
      setNoteTags(tagsMap);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load notes';
      if (!message.includes('Supabase not configured')) {
        setError(message);
      }
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [activeWorkspaceId, isOpen, loadNotes]);

  const handleDeleteNote = async (noteId: string) => {
    try {
      await knowledgeDB.deleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      noteTags.delete(noteId);
      setNoteTags(new Map(noteTags));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete note'
      );
    }
  };

  // Get unique tags from all notes
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    noteTags.forEach((noteTags) => {
      noteTags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [noteTags]);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      !selectedTag || (noteTags.get(note.id) || []).includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const handleNewNote = () => {
    router.push('/app/knowledge/new');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold font-crimson text-slate-900 dark:text-white">
                Knowledge Base
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'} in this
                workspace
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Search and New Button */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search notes by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            <button
              onClick={handleNewNote}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
              title="Create new note"
            >
              ➕ New
            </button>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                All ({notes.length})
              </button>
              {allTags.map((tag) => {
                const count = notes.filter(
                  (n) => (noteTags.get(n.id) || []).includes(tag)
                ).length;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedTag === tag
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {tag} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner message="Loading notes..." />
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-red-600 dark:text-red-400 font-medium">
                Error loading notes
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {error}
              </p>
              <button
                onClick={loadNotes}
                className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
              >
                Try again
              </button>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">📚</div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                {searchQuery ? 'No notes found' : 'Knowledge Base is empty'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? `Try searching for different keywords`
                  : `Save your first search to get started building your knowledge base`}
              </p>
              {!searchQuery && (
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-lg transition-colors"
                >
                  Start searching
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={() => {
                    handleDeleteNote(note.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
