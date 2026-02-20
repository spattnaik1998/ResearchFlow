import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/auth-helpers';

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
    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured');
      return NextResponse.json(
        { error: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.' },
        { status: 500 }
      );
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspace');
    const range = (searchParams.get('range') || '7d') as TimeRange;
    const isGlobalView = !workspaceId || workspaceId === 'all';

    if (!supabase) {
      return NextResponse.json(
        { error: 'Analytics not configured' },
        { status: 500 }
      );
    }

    // Fetch dashboard data - all queries in parallel
    // Build queries conditionally based on whether we're viewing all workspaces or a specific one
    const dateFilter = new Date(Date.now() - getDateRangeMS(range)).toISOString().split('T')[0];

    const [
      { data: dailyData, error: dailyError },
      { data: topQueries, error: topError },
      { data: workspaceStats, error: statsError },
      { data: hourlyData, error: hourlyError },
    ] = await Promise.all([
      // Daily trends
      (() => {
        let query = supabase
          .from('analytics_daily_searches')
          .select('*')
          .eq('user_id', user.id);

        if (!isGlobalView) {
          query = query.eq('workspace_id', workspaceId);
        }

        return query
          .gte('date', dateFilter)
          .order('date', { ascending: false });
      })(),

      // Top queries
      (() => {
        let query = supabase
          .from('analytics_events')
          .select('metadata')
          .eq('user_id', user.id);

        if (!isGlobalView) {
          query = query.eq('workspace_id', workspaceId);
        }

        return query
          .eq('event_type', 'search')
          .gte('created_at', new Date(Date.now() - getDateRangeMS(range)).toISOString())
          .limit(100);
      })(),

      // Workspace stats
      (() => {
        let query = supabase
          .from('analytics_workspace_activity')
          .select('*')
          .eq('user_id', user.id);

        if (!isGlobalView) {
          query = query.eq('workspace_id', workspaceId);
        }

        return query;
      })(),

      // Hourly activity
      (() => {
        let query = supabase
          .from('analytics_hourly_activity')
          .select('*')
          .eq('user_id', user.id);

        if (!isGlobalView) {
          query = query.eq('workspace_id', workspaceId);
        }

        return query;
      })(),
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
        // Sum event counts when in global view (multiple workspaces)
        heatmapData[day][hour] = (heatmapData[day][hour] || 0) + (h.event_count || 0);
      }
    }

    // Format daily data for charts
    const formattedDaily = (() => {
      if (!dailyData || dailyData.length === 0) return [];

      if (isGlobalView) {
        // Group by date and sum across workspaces for global view
        const dateMap = new Map<string, { searches: number; summaries: number; questions: number; notes: number; exports: number }>();

        for (const d of dailyData) {
          const day = d as unknown as {
            date: string;
            search_count: number;
            summary_count: number;
            question_count: number;
            note_create_count: number;
            export_count: number;
          };

          const existing = dateMap.get(day.date) || {
            searches: 0,
            summaries: 0,
            questions: 0,
            notes: 0,
            exports: 0,
          };

          dateMap.set(day.date, {
            searches: existing.searches + (day.search_count || 0),
            summaries: existing.summaries + (day.summary_count || 0),
            questions: existing.questions + (day.question_count || 0),
            notes: existing.notes + (day.note_create_count || 0),
            exports: existing.exports + (day.export_count || 0),
          });
        }

        return Array.from(dateMap.values())
          .map((trend) => ({
            date: Array.from(dateMap.entries()).find(([, v]) => v === trend)?.[0] || '',
            ...trend,
          }))
          .filter((d) => d.date)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 30);
      }

      // Single workspace view
      return (dailyData as unknown as Array<{
        date: string;
        search_count: number;
        summary_count: number;
        question_count: number;
        note_create_count: number;
        export_count: number;
      }>)
        .map((d) => ({
          date: d.date,
          searches: d.search_count || 0,
          summaries: d.summary_count || 0,
          questions: d.question_count || 0,
          notes: d.note_create_count || 0,
          exports: d.export_count || 0,
        }))
        .slice(0, 30);
    })();

    // Calculate summary stats
    const summaryStats = (() => {
      if (isGlobalView && workspaceStats && Array.isArray(workspaceStats) && workspaceStats.length > 0) {
        // Aggregate across all workspaces
        return {
          total_searches: workspaceStats.reduce((sum, ws: unknown) => {
            const w = ws as { total_searches?: number };
            return sum + (w.total_searches || 0);
          }, 0),
          total_summaries: workspaceStats.reduce((sum, ws: unknown) => {
            const w = ws as { total_summaries?: number };
            return sum + (w.total_summaries || 0);
          }, 0),
          total_questions: workspaceStats.reduce((sum, ws: unknown) => {
            const w = ws as { total_questions?: number };
            return sum + (w.total_questions || 0);
          }, 0),
          total_notes_created: workspaceStats.reduce((sum, ws: unknown) => {
            const w = ws as { total_notes_created?: number };
            return sum + (w.total_notes_created || 0);
          }, 0),
          active_days: Math.max(
            ...((workspaceStats as unknown[]) || []).map((ws: unknown) => {
              const w = ws as { active_days?: number };
              return w.active_days || 0;
            }),
            0
          ),
        };
      }

      // Single workspace view
      const stats = (workspaceStats?.[0] as unknown as {
        total_searches?: number;
        total_summaries?: number;
        total_questions?: number;
        total_notes_created?: number;
        active_days?: number;
      }) || {};

      return {
        total_searches: stats.total_searches || 0,
        total_summaries: stats.total_summaries || 0,
        total_questions: stats.total_questions || 0,
        total_notes_created: stats.total_notes_created || 0,
        active_days: stats.active_days || 0,
      };
    })();

    return NextResponse.json({
      range,
      daily_trends: formattedDaily,
      top_queries: topQueriesList,
      workspace_stats: isGlobalView ? (workspaceStats || []) : (workspaceStats?.[0] || {}),
      hourly_heatmap: heatmapData,
      summary: summaryStats,
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
