import React from 'react';

interface Query {
  query: string;
  search_count: number;
  avg_duration_ms: number;
  last_searched_at: string;
}

interface TopQueriesTableProps {
  queries: Query[];
}

export function TopQueriesTable({ queries }: TopQueriesTableProps) {
  if (!queries || queries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">No search data available yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Rank</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Query</th>
            <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Count</th>
            <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Avg Duration</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">Last Searched</th>
          </tr>
        </thead>
        <tbody>
          {queries.map((query, index) => (
            <tr
              key={index}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-semibold">
                  {index + 1}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-slate-900 dark:text-slate-100 font-medium truncate">{query.query}</span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                  {query.search_count}
                </span>
              </td>
              <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                {query.avg_duration_ms}ms
              </td>
              <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                {new Date(query.last_searched_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
