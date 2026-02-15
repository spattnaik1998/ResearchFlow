'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  noteIds?: string[];
  defaultFormat?: 'markdown' | 'pdf' | 'csv';
  title?: string;
}

export function ExportDialog({
  isOpen,
  onClose,
  workspaceId,
  noteIds,
  defaultFormat = 'markdown',
  title = 'Export Notes',
}: ExportDialogProps) {
  const [format, setFormat] = useState<'markdown' | 'pdf' | 'csv'>(defaultFormat);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setError(null);
    setIsExporting(true);

    try {
      let endpoint = '';
      let method = 'POST';
      const body: Record<string, unknown> = {
        workspace_id: workspaceId,
        include_timestamps: includeTimestamps,
        note_ids: noteIds,
      };

      switch (format) {
        case 'markdown':
          endpoint = '/api/export/markdown';
          break;
        case 'pdf':
          endpoint = '/api/export/pdf';
          break;
        case 'csv':
          endpoint = '/api/export/csv';
          body.export_type = 'notes';
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Export failed with status ${response.status}`);
      }

      // Get the file from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Determine filename
      const extension = format === 'markdown' ? 'md' : format === 'pdf' ? 'html' : 'csv';
      a.download = `research-export-${Date.now()}.${extension}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDescriptions: Record<string, string> = {
    markdown: 'Clean markdown format - best for note-taking apps and static sites',
    pdf: 'HTML format - print to PDF from browser or use a PDF converter',
    csv: 'Spreadsheet format - for data analysis and importing into tools',
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Export Format
            </label>
            <div className="space-y-2">
              {(['markdown', 'pdf', 'csv'] as const).map((fmt) => (
                <label key={fmt} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={format === fmt}
                    onChange={(e) => setFormat(e.target.value as typeof format)}
                    className="w-4 h-4 text-teal-600 dark:text-teal-400"
                    disabled={isExporting}
                  />
                  <span className="ml-3 block">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {fmt === 'markdown' ? 'Markdown (.md)' : fmt === 'pdf' ? 'HTML/Print (.html)' : 'CSV (.csv)'}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                      {formatDescriptions[fmt]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeTimestamps}
                onChange={(e) => setIncludeTimestamps(e.target.checked)}
                className="w-4 h-4 text-teal-600 dark:text-teal-400"
                disabled={isExporting}
              />
              <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                Include Creation Timestamps
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isExporting} size="sm">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            size="sm"
            className="flex items-center gap-2"
          >
            {isExporting && <LoadingSpinner size="sm" />}
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>
    </div>
  );
}
