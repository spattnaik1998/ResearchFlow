import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser, validateWorkspaceOwnership } from '@/lib/auth-helpers';
import { generatePDFHTML, type ExportableNote } from '@/lib/export-formatters';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * Escape HTML special characters to prevent XSS when content is embedded in HTML
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspace_id, note_ids, include_timestamps, format } = await request.json();

    if (!workspace_id) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Validate that user owns this workspace
    const serverSupabase = await createSupabaseServerClient();
    const ownsWorkspace = await validateWorkspaceOwnership(serverSupabase, workspace_id, user.id);
    if (!ownsWorkspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Fetch notes
    let query = supabase
      .from('knowledge_notes')
      .select(
        `
        id,
        title,
        content,
        created_at,
        search_query,
        note_tags:note_tags(tag)
      `
      )
      .eq('workspace_id', workspace_id)
      .eq('user_id', user.id);

    if (note_ids && note_ids.length > 0) {
      query = query.in('id', note_ids);
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error('Export error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    // Format notes for export
    const formattedNotes: ExportableNote[] = (notes || []).map((note: any) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      created_at: note.created_at,
      search_query: note.search_query,
      tags: note.note_tags?.map((nt: any) => nt.tag) || [],
    }));

    // Generate HTML content
    let htmlContent = '';

    if (formattedNotes.length === 1) {
      const note = formattedNotes[0];
      htmlContent = `
        <h1>${escapeHtml(note.title)}</h1>
        ${note.tags && note.tags.length > 0 ? `<p><strong>Tags:</strong> ${note.tags.map((t) => `<code>${escapeHtml(t)}</code>`).join(', ')}</p>` : ''}
        ${include_timestamps ? `<p><em>Created on ${new Date(note.created_at).toLocaleString()}</em></p>` : ''}
        <div>${escapeHtml(note.content)}</div>
      `;
    } else {
      htmlContent = formattedNotes
        .map(
          (note) => `
        <h2>${escapeHtml(note.title)}</h2>
        ${note.tags && note.tags.length > 0 ? `<p><strong>Tags:</strong> ${note.tags.map((t) => `<code>${escapeHtml(t)}</code>`).join(', ')}</p>` : ''}
        ${include_timestamps ? `<p><em>Created on ${new Date(note.created_at).toLocaleString()}</em></p>` : ''}
        <div>${escapeHtml(note.content)}</div>
        <hr>
      `
        )
        .join('');
    }

    const fullHTML = generatePDFHTML(
      formattedNotes.length === 1 ? formattedNotes[0].title : 'Research Notes',
      htmlContent,
      true
    );

    // Return HTML for print or jsPDF processing
    if (format === 'html') {
      return new NextResponse(fullHTML, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // Default: return as HTML that can be printed to PDF
    return new NextResponse(fullHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="research-notes-${Date.now()}.html"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}
