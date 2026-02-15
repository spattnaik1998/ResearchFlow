import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type TimeRange = '7d' | '30d' | '90d';

function getDateRangeMS(range: TimeRange): number {
  const ranges: Record<TimeRange, number> = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };
  return ranges[range] || ranges['7d'];
}


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspace');
    const range = (searchParams.get('range') || '7d') as TimeRange;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace parameter is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Analytics not configured' },
        { status: 500 }
      );
    }

    // Fetch dashboard data - all queries in parallel
    const [
      { data: dailyData, error: dailyError },
      { data: topQueries, error: topError },
      { data: workspaceStats, error: statsError },
      { data: hourlyData, error: hourlyError },
    ] = await Promise.all([
      // Daily trends
      supabase
        .from('analytics_daily_searches')
        .select('*')
        .eq('workspace_id', workspaceId)
        .gte('date', new Date(Date.now() - getDateRangeMS(range)).toISOString().split('T')[0])
        .order('date', { ascending: false }),

      // Top queries
      supabase
        .from('analytics_events')
        .select('metadata')
        .eq('workspace_id', workspaceId)
        .eq('event_type', 'search')
        .gte('created_at', `now() - interval '${range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}'`)
        .limit(100),

      // Workspace stats
      supabase.from('analytics_workspace_activity').select('*').eq('workspace_id', workspaceId),

      // Hourly activity
      supabase
        .from('analytics_hourly_activity')
        .select('*')
        .eq('workspace_id', workspaceId)
        .gte('hour', `now() - interval '7 days'`),
    ]);

    if (dailyError || topError || statsError || hourlyError) {
      console.error('Analytics query errors:', {
        dailyError,
        topError,
        statsError,
        hourlyError,
      });
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Process top queries from raw events
    const queryMap = new Map<string, { count: number; total_duration: number; last_searched: string }>();

    if (topQueries) {
      for (const event of topQueries) {
        const metadata = event.metadata as Record<string, unknown>;
        const query = metadata?.query as string;
        if (query) {
          const current = queryMap.get(query) || { count: 0, total_duration: 0, last_searched: '' };
          const duration = (metadata?.duration_ms as number) || 0;
          queryMap.set(query, {
            count: current.count + 1,
            total_duration: current.total_duration + duration,
            last_searched: new Date().toISOString(),
          });
        }
      }
    }

    // Sort and get top 10
    const topQueriesList = Array.from(queryMap.entries())
      .map(([query, stats]) => ({
        query,
        search_count: stats.count,
        avg_duration_ms: Math.round(stats.total_duration / stats.count),
        last_searched_at: stats.last_searched,
      }))
      .sort((a, b) => b.search_count - a.search_count)
      .slice(0, 10);

    // Process hourly data into heatmap format
    const heatmapData: Record<string, Record<number, number>> = {};
    if (hourlyData) {
      for (const record of hourlyData) {
        const h = record as unknown as { hour_of_day: number; day_of_week: number; event_count: number };
        const day = h.day_of_week;
        const hour = h.hour_of_day;
        if (!heatmapData[day]) heatmapData[day] = {};
        heatmapData[day][hour] = h.event_count;
      }
    }

    // Format daily data for charts
    const formattedDaily = (dailyData || [])
      .map((d: unknown) => {
        const day = d as {
          date: string;
          search_count: number;
          summary_count: number;
          question_count: number;
          note_create_count: number;
          export_count: number;
        };
        return {
          date: day.date,
          searches: day.search_count || 0,
          summaries: day.summary_count || 0,
          questions: day.question_count || 0,
          notes: day.note_create_count || 0,
          exports: day.export_count || 0,
        };
      })
      .slice(0, 30);

    return NextResponse.json({
      range,
      daily_trends: formattedDaily,
      top_queries: topQueriesList,
      workspace_stats: workspaceStats?.[0] || {},
      hourly_heatmap: heatmapData,
      summary: {
        total_searches: (workspaceStats?.[0] as unknown as { total_searches: number })?.total_searches || 0,
        total_summaries: (workspaceStats?.[0] as unknown as { total_summaries: number })?.total_summaries || 0,
        total_questions: (workspaceStats?.[0] as unknown as { total_questions: number })?.total_questions || 0,
        total_notes_created:
          (workspaceStats?.[0] as unknown as { total_notes_created: number })?.total_notes_created || 0,
        active_days: (workspaceStats?.[0] as unknown as { active_days: number })?.active_days || 0,
      },
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
