'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { knowledgeDB } from '@/lib/knowledge-db';
import { useToast } from '@/lib/hooks';
import type { KnowledgeNote } from '@/types';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import dynamic from 'next/dynamic';

// Dynamically import Markdown component for better performance
const Markdown = dynamic(() => import('react-markdown').then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className="text-slate-500">Loading preview...</div>,
});

interface NoteEditorProps {
  noteId?: string;
  mode?: 'edit' | 'view';
}

export function NoteEditor({ noteId, mode = 'edit' }: NoteEditorProps) {
  const [note, setNote] = useState<KnowledgeNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(!!noteId);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { success, error: showError } = useToast();

  const workspaceId = activeWorkspaceId || '';

  const loadNote = useCallback(async () => {
    setLoading(true);
    try {
      const data = await knowledgeDB.getNote(noteId!);
      setNote(data);
      setTitle(data.title);
      setContent(data.content);

      const noteTags = await knowledgeDB.getNoteTags(noteId!);
      setTags(noteTags);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load note');
      setTimeout(() => router.back(), 2000);
    } finally {
      setLoading(false);
    }
  }, [noteId, showError, router]);

  useEffect(() => {
    if (noteId && mode === 'edit') {
      loadNote();
    }
  }, [noteId, mode, loadNote]);

  const handleAddTag = () => {
    const normalizedTag = tagInput.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showError('Title and content are required');
      return;
    }

    setSaving(true);

    try {
      let savedNote: KnowledgeNote;

      if (noteId && note) {
        // Update existing
        savedNote = await knowledgeDB.updateNote(noteId, {
          title,
          content,
        });

        // Update tags (remove old, add new)
        const oldTags = await knowledgeDB.getNoteTags(noteId);
        for (const oldTag of oldTags) {
          if (!tags.includes(oldTag)) {
            await knowledgeDB.removeTag(noteId, oldTag);
          }
        }
        for (const tag of tags) {
          if (!oldTags.includes(tag)) {
            await knowledgeDB.addTag(noteId, tag);
          }
        }
      } else {
        // Create new
        savedNote = await knowledgeDB.createNote({
          workspace_id: workspaceId,
          title,
          content,
        });

        // Add tags
        for (const tag of tags) {
          await knowledgeDB.addTag(savedNote.id, tag);
        }
      }

      success('✨ Note saved successfully');
      setTimeout(() => {
        router.push(`/app/knowledge/${savedNote.id}`);
      }, 500);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteId || !confirm('Delete this note? This cannot be undone.')) return;

    setSaving(true);
    try {
      await knowledgeDB.deleteNote(noteId);
      success('Note deleted');
      setTimeout(() => {
        router.push('/app/knowledge');
      }, 500);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner message="Loading note..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-teal-900 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/app/knowledge')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-2xl leading-none"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPreviewMode(!previewMode)}
              className="transition-all"
            >
              {previewMode ? '✏️ Edit' : '👁️ Preview'}
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              Save Note
            </Button>
            {noteId && (
              <Button
                variant="ghost"
                onClick={handleDelete}
                isLoading={saving}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                🗑️
              </Button>
            )}
          </div>
        </div>

        {/* Editor/Preview */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          {!previewMode ? (
            <div className="space-y-0">
              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full text-3xl font-bold font-crimson border-none border-b border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors"
              />

              {/* Tags Input */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tags
                </label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleRemoveTag(tag)}
                      className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors flex items-center gap-1"
                    >
                      {tag}
                      <span className="ml-1 cursor-pointer">×</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tags (press Enter)..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Content Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note in Markdown..."
                className="w-full h-96 p-6 font-mono text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-none resize-none focus:outline-none transition-colors"
              />
            </div>
          ) : (
            /* Preview Mode */
            <div className="prose dark:prose-invert max-w-none p-6">
              <h1 className="font-crimson text-slate-900 dark:text-white mb-4">{title}</h1>
              <div className="mb-4 flex gap-2 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="prose dark:prose-invert prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-white max-w-none">
                <Markdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-slate-700 dark:text-slate-300">{children}</p>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside text-slate-700 dark:text-slate-300 space-y-1">
                        {children}
                      </ol>
                    ),
                    code: ({ children }) => (
                      <code className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-900 dark:text-white font-mono text-sm">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {content}
                </Markdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
