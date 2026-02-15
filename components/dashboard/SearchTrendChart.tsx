'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendData {
  date: string;
  searches: number;
  summaries: number;
  questions: number;
  notes: number;
  exports: number;
}

interface SearchTrendChartProps {
  data: TrendData[];
}

export function SearchTrendChart({ data }: SearchTrendChartProps) {
  // Format data for display
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis
          dataKey="date"
          className="text-slate-600 dark:text-slate-400"
          tick={{ fill: 'currentColor', fontSize: 12 }}
        />
        <YAxis className="text-slate-600 dark:text-slate-400" tick={{ fill: 'currentColor', fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            borderRadius: '0.5rem',
            color: '#fff',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="searches"
          stroke="#0f4c5c"
          strokeWidth={2}
          dot={false}
          name="Searches"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="summaries"
          stroke="#fb8500"
          strokeWidth={2}
          dot={false}
          name="Summaries"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="questions"
          stroke="#a855f7"
          strokeWidth={2}
          dot={false}
          name="Questions"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="notes"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          name="Notes"
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
