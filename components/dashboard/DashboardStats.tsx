import React from 'react';

interface DashboardStatsProps {
  summary: {
    total_searches: number;
    total_summaries: number;
    total_questions: number;
    total_notes_created: number;
    active_days: number;
  };
}

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value.toLocaleString()}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

export function DashboardStats({ summary }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        icon="🔍"
        label="Total Searches"
        value={summary.total_searches}
        color="text-teal-600 dark:text-teal-400"
      />
      <StatCard
        icon="✨"
        label="Summaries Generated"
        value={summary.total_summaries}
        color="text-amber-600 dark:text-amber-400"
      />
      <StatCard
        icon="❓"
        label="Questions Asked"
        value={summary.total_questions}
        color="text-purple-600 dark:text-purple-400"
      />
      <StatCard
        icon="📝"
        label="Notes Created"
        value={summary.total_notes_created}
        color="text-blue-600 dark:text-blue-400"
      />
      <StatCard icon="📅" label="Active Days" value={summary.active_days} color="text-green-600 dark:text-green-400" />
    </div>
  );
}
