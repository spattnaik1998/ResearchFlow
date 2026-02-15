import React, { useMemo } from 'react';

interface ActivityHeatmapProps {
  data: Record<string, Record<number, number>>;
}

const getHeatmapColor = (value: number, max: number) => {
  if (value === 0) return 'bg-slate-100 dark:bg-slate-800';
  const intensity = Math.min(value / Math.max(max, 1), 1);

  if (intensity < 0.25) return 'bg-teal-100 dark:bg-teal-900/20';
  if (intensity < 0.5) return 'bg-teal-300 dark:bg-teal-700/40';
  if (intensity < 0.75) return 'bg-teal-500 dark:bg-teal-600/60';
  return 'bg-teal-700 dark:bg-teal-500/80';
};

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Memoize constants
  const dayLabels = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  // Calculate max value for color scaling
  const maxValue = useMemo(() => {
    let max = 0;
    for (const dayData of Object.values(data)) {
      for (const count of Object.values(dayData)) {
        if (count > max) max = count;
      }
    }
    return Math.max(max, 1);
  }, [data]);

  // Format data into a grid
  const gridData = useMemo(() => {
    return dayLabels.map((_, dayIndex) => {
      const dayData = data[dayIndex] || {};
      return hours.map((hour) => ({
        day: dayIndex,
        hour,
        value: dayData[hour] || 0,
      }));
    });
  }, [data, dayLabels, hours]);

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">No activity data available yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full p-4">
        {/* Hour labels */}
        <div className="flex">
          <div className="w-12" />
          {hours.map((hour) => (
            <div key={hour} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
              {hour.toString().padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Heatmap rows */}
        {gridData.map((row, dayIndex) => (
          <div key={dayIndex} className="flex items-center">
            <div className="w-12 h-8 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
              {dayLabels[dayIndex]}
            </div>
            {row.map((cell, hourIndex) => (
              <div
                key={`${dayIndex}-${hourIndex}`}
                className={`w-8 h-8 border border-slate-200 dark:border-slate-700 ${getHeatmapColor(
                  cell.value,
                  maxValue
                )}`}
                title={`${dayLabels[dayIndex]} ${cell.hour.toString().padStart(2, '0')}:00 - ${cell.value} events`}
              />
            ))}
          </div>
        ))}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 border border-slate-200 dark:border-slate-700 ${getHeatmapColor(
                  (i + 1) * (maxValue / 4),
                  maxValue
                )}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
