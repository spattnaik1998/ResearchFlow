import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/auth-helpers';
import { formatNotesAsMarkdown, type ExportableNote } from '@/lib/export-formatters';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspace_id, note_ids, include_timestamps } = await request.json();

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

    // Generate markdown
    const markdown = formatNotesAsMarkdown(formattedNotes, include_timestamps ?? true);

    // Return as file download
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="research-notes-${Date.now()}.md"`,
      },
    });
  } catch (error) {
    console.error('Markdown export error:', error);
    return NextResponse.json(
      { error: 'Failed to export markdown' },
      { status: 500 }
    );
  }
}
