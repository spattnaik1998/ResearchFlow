'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { SearchTrendChart } from '@/components/dashboard/SearchTrendChart';
import { TopQueriesTable } from '@/components/dashboard/TopQueriesTable';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { ExportDialog } from '@/components/export/ExportDialog';

interface DashboardData {
  range: '7d' | '30d' | '90d';
  daily_trends: Array<{
    date: string;
    searches: number;
    summaries: number;
    questions: number;
    notes: number;
    exports: number;
  }>;
  top_queries: Array<{
    query: string;
    search_count: number;
    avg_duration_ms: number;
    last_searched_at: string;
  }>;
  workspace_stats: Record<string, unknown>;
  hourly_heatmap: Record<string, Record<number, number>>;
  summary: {
    total_searches: number;
    total_summaries: number;
    total_questions: number;
    total_notes_created: number;
    active_days: number;
  };
}

type TimeRange = '7d' | '30d' | '90d';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');

  const { activeWorkspaceId, workspaces } = useWorkspaceStore();
  const currentWorkspace = selectedWorkspace === 'all' ? null : workspaces.find((w) => w.id === selectedWorkspace);

  useEffect(() => {
    // Initialize with active workspace
    if (activeWorkspaceId) {
      setSelectedWorkspace(activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/analytics/dashboard?workspace=${selectedWorkspace}&range=${timeRange}`
        );

        if (!response.ok) {
          let errorDetail = 'Unknown error';
          try {
            const errorData = await response.json();
            errorDetail = errorData.error || `HTTP ${response.status}`;
          } catch {
            errorDetail = `HTTP ${response.status} ${response.statusText}`;
          }
          throw new Error(`Failed to fetch dashboard data: ${errorDetail}`);
        }

        const dashboardData: DashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(errorMsg);
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedWorkspace, timeRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Back to Search"
            >
              <span className="text-xl">←</span>
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-crimson-pro">Analytics Dashboard</h1>
              {selectedWorkspace === 'all' ? (
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  🌐 All Workspaces • {workspaces.filter((w) => !w.isArchived).length} workspaces
                </p>
              ) : (
                currentWorkspace && (
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {currentWorkspace.icon} {currentWorkspace.name} • {currentWorkspace.color}
                  </p>
                )
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExportOpen(true)}
            >
              📥 Export
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Workspace Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Workspace:
          </label>
          <select
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-colors"
          >
            <option value="all">🌐 All Workspaces</option>
            {workspaces
              .filter((ws) => !ws.isArchived)
              .map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.icon} {ws.name}
                </option>
              ))}
          </select>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'primary' : 'secondary'}
              size="sm"
            >
              Last {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage title="Failed to load dashboard" message={error} />
        ) : data ? (
          <div className="space-y-8">
            {/* Key Stats Cards */}
            <DashboardStats summary={data.summary} />

            {/* Search Trends Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 font-crimson-pro">
                Search Trends
              </h2>
              <SearchTrendChart data={data.daily_trends} />
            </div>

            {/* Activity Heatmap */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 font-crimson-pro">
                Activity Heatmap
              </h2>
              <ActivityHeatmap data={data.hourly_heatmap} />
            </div>

            {/* Top Queries */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 font-crimson-pro">
                Top Queries
              </h2>
              <TopQueriesTable queries={data.top_queries} />
            </div>
          </div>
        ) : null}
      </main>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        workspaceId={activeWorkspaceId || 'default'}
        title="Export Analytics Data"
      />
    </div>
  );
}
