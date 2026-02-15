/**
 * Export formatters for converting search/note data to various formats
 */

export interface ExportableNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags?: string[];
  search_query?: string;
}

export interface ExportableSearch {
  query: string;
  summary: string;
  results_count: number;
  timestamp: number;
  questions?: string[];
  key_points?: string[];
}

/**
 * Format notes as Markdown
 */
export function formatNotesAsMarkdown(notes: ExportableNote[], includeTimestamps: boolean = true): string {
  const sections = notes.map((note) => {
    let markdown = `# ${note.title}\n\n`;

    if (note.tags && note.tags.length > 0) {
      markdown += `**Tags:** ${note.tags.map((t) => `\`${t}\``).join(', ')}\n\n`;
    }

    if (includeTimestamps) {
      const date = new Date(note.created_at).toLocaleDateString();
      const time = new Date(note.created_at).toLocaleTimeString();
      markdown += `*Created on ${date} at ${time}*\n\n`;
    }

    markdown += note.content;

    return markdown;
  });

  return (
    sections.join('\n\n---\n\n') +
    `\n\n---\n\n*Exported from ResearchFlow on ${new Date().toLocaleString()}*`
  );
}

/**
 * Format search results as Markdown
 */
export function formatSearchAsMarkdown(
  search: ExportableSearch,
  includeTimestamps: boolean = true,
  includeSources: boolean = true
): string {
  let markdown = `# ${search.query}\n\n`;

  if (includeTimestamps) {
    const date = new Date(search.timestamp).toLocaleDateString();
    const time = new Date(search.timestamp).toLocaleTimeString();
    markdown += `*Searched on ${date} at ${time}*\n\n`;
  }

  markdown += `## Summary\n${search.summary}\n\n`;

  if (search.key_points && search.key_points.length > 0) {
    markdown += `## Key Points\n${search.key_points.map((p) => `- ${p}`).join('\n')}\n\n`;
  }

  if (search.questions && search.questions.length > 0) {
    markdown += `## Explore More\n${search.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`;
  }

  if (includeSources) {
    markdown += `## Metadata\n- Results Found: ${search.results_count}\n`;
  }

  markdown += `\n---\n*Exported from ResearchFlow on ${new Date().toLocaleString()}*`;

  return markdown;
}

/**
 * Format notes as CSV
 */
export function formatNotesAsCSV(notes: ExportableNote[]): string {
  // CSV header
  const headers = ['Title', 'Search Query', 'Tags', 'Created At', 'Content Length'];
  const lines = [headers.map((h) => `"${h}"`).join(',')];

  // CSV rows
  for (const note of notes) {
    const row = [
      `"${note.title.replace(/"/g, '""')}"`,
      `"${(note.search_query || '').replace(/"/g, '""')}"`,
      `"${(note.tags?.join(', ') || '').replace(/"/g, '""')}"`,
      `"${new Date(note.created_at).toLocaleString()}"`,
      note.content.length,
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Format analytics data as CSV
 */
export interface AnalyticsRow {
  date: string;
  query: string;
  results_count: number;
  search_duration_ms: number;
  has_summary: boolean;
  questions_count: number;
}

export function formatAnalyticsAsCSV(rows: AnalyticsRow[]): string {
  const headers = ['Date', 'Query', 'Results Count', 'Duration (ms)', 'Summary', 'Questions'];
  const lines = [headers.map((h) => `"${h}"`).join(',')];

  for (const row of rows) {
    const csvRow = [
      `"${row.date}"`,
      `"${row.query.replace(/"/g, '""')}"`,
      row.results_count,
      row.search_duration_ms,
      row.has_summary ? 'Yes' : 'No',
      row.questions_count,
    ];
    lines.push(csvRow.join(','));
  }

  return lines.join('\n');
}

/**
 * Generate PDF HTML content (for browser print or jsPDF)
 */
export function generatePDFHTML(title: string, content: string, includeHeader: boolean = true): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: white;
      padding: 40px;
    }

    @media (max-width: 768px) {
      body {
        padding: 20px;
      }
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 20px;
      color: #0f4c5c;
      font-family: 'Crimson Pro', serif;
    }

    h2 {
      font-size: 1.8em;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #0f4c5c;
      font-family: 'Crimson Pro', serif;
      border-bottom: 2px solid #fb8500;
      padding-bottom: 10px;
    }

    h3 {
      font-size: 1.3em;
      margin-top: 20px;
      margin-bottom: 10px;
      color: #1f2937;
      font-family: 'Crimson Pro', serif;
    }

    p {
      margin-bottom: 15px;
      text-align: justify;
    }

    ul, ol {
      margin-left: 30px;
      margin-bottom: 15px;
    }

    li {
      margin-bottom: 8px;
    }

    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.9em;
    }

    pre {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin-bottom: 15px;
      border-left: 3px solid #fb8500;
    }

    pre code {
      background: none;
      padding: 0;
    }

    a {
      color: #0f4c5c;
      text-decoration: none;
      border-bottom: 1px solid #0f4c5c;
    }

    a:hover {
      background: #e0f2f1;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #d1d5db;
    }

    th {
      background: #f3f4f6;
      font-weight: 600;
      color: #1f2937;
    }

    blockquote {
      border-left: 4px solid #fb8500;
      padding-left: 20px;
      margin-left: 0;
      margin-bottom: 15px;
      font-style: italic;
      color: #6b7280;
    }

    .metadata {
      background: #f9fafb;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
      border: 1px solid #e5e7eb;
      font-size: 0.9em;
      color: #6b7280;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 0.85em;
      color: #9ca3af;
      text-align: center;
    }

    @media print {
      body {
        padding: 0;
      }

      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  ${includeHeader ? `<div class="metadata">
    <strong>ResearchFlow Export</strong><br>
    Generated on ${new Date().toLocaleString()}<br>
    <em>This document was exported from ResearchFlow</em>
  </div>` : ''}

  ${content}

  <div class="footer">
    <p>ResearchFlow • AI-Powered Research Assistant</p>
    <p>Exported on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `.trim();
}
