'use client';

import { useRouter } from 'next/navigation';
import type { KnowledgeNote } from '@/types';
import { Card } from '@/components/Card';

interface NoteCardProps {
  note: KnowledgeNote;
  onDelete?: () => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const router = useRouter();

  // Extract preview text (first 150 characters)
  const preview = note.content
    .replace(/^#.*\n/m, '') // Remove title
    .replace(/#{2,} /g, '') // Remove headers
    .trim()
    .substring(0, 150)
    .concat(note.content.length > 150 ? '...' : '');

  const createdDate = new Date(note.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleClick = () => {
    router.push(`/app/knowledge/${note.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${note.title}"?`)) {
      onDelete?.();
    }
  };

  return (
    <Card
      className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={handleClick}
    >
      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-crimson font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {note.title}
        </h3>

        {/* Preview */}
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 min-h-[3.6rem]">
          {preview || '(empty note)'}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="font-medium">{createdDate}</span>

          <div className="flex items-center gap-2">
            {note.metadata?.keyPoints && note.metadata.keyPoints.length > 0 && (
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs font-medium">
                {note.metadata.keyPoints.length} points
              </span>
            )}

            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all p-1"
              aria-label="Delete note"
              title="Delete note"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
