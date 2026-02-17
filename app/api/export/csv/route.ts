import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/auth-helpers';
import { formatNotesAsCSV, formatAnalyticsAsCSV, type AnalyticsRow } from '@/lib/export-formatters';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspace_id, export_type } = await request.json();

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

    let csvContent = '';
    let filename = '';

    if (export_type === 'notes') {
      // Export notes as CSV
      const { data: notes, error } = await supabase
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch notes');
      }

      const formattedNotes = (notes || []).map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        created_at: note.created_at,
        search_query: note.search_query,
        tags: note.note_tags?.map((nt: any) => nt.tag) || [],
      }));

      csvContent = formatNotesAsCSV(formattedNotes);
      filename = `notes-export-${Date.now()}.csv`;
    } else if (export_type === 'analytics') {
      // Export analytics data as CSV
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('workspace_id', workspace_id)
        .eq('user_id', user.id)
        .eq('event_type', 'search')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsRows: AnalyticsRow[] = (events || []).map((event: any) => ({
        date: new Date(event.created_at).toLocaleString(),
        query: event.metadata?.query || '',
        results_count: event.metadata?.results_count || 0,
        search_duration_ms: event.metadata?.duration_ms || 0,
        has_summary: false,
        questions_count: event.metadata?.question_count || 0,
      }));

      csvContent = formatAnalyticsAsCSV(analyticsRows);
      filename = `analytics-export-${Date.now()}.csv`;
    } else {
      return NextResponse.json(
        { error: 'Invalid export_type' },
        { status: 400 }
      );
    }

    // Return as CSV file download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
