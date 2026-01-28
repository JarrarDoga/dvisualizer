'use client';

import * as React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
  Line,
} from 'recharts';
import { CHART_COLORS } from '@/types';

interface ScatterChartComponentProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  yAxisKey: string;
  zAxisKey?: string;
  categoryKey?: string;
  title?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTrendLine?: boolean;
  colors?: string[];
}

// Calculate linear regression for trend line
function calculateLinearRegression(data: Record<string, unknown>[], xKey: string, yKey: string) {
  const points = data
    .map(d => ({ x: Number(d[xKey]), y: Number(d[yKey]) }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y));

  if (points.length < 2) return null;

  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Get min and max X values for the line
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));

  return {
    slope,
    intercept,
    points: [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept },
    ],
  };
}

export function ScatterChartComponent({
  data,
  xAxisKey,
  yAxisKey,
  zAxisKey,
  categoryKey,
  title,
  showGrid = true,
  showLegend = true,
  showTrendLine = false,
  colors = [...CHART_COLORS],
}: ScatterChartComponentProps) {
  // Only group by category if categoryKey is provided AND has reasonable number of unique values
  const groupedData = React.useMemo(() => {
    if (!categoryKey) {
      return [{ name: 'Data', data }];
    }

    // Count unique values
    const uniqueValues = new Set(data.map(item => String(item[categoryKey] || 'Other')));
    
    // If too many unique values (more than 10), don't group - treat as single series
    if (uniqueValues.size > 10) {
      return [{ name: 'Data', data }];
    }

    const groups = new Map<string, Record<string, unknown>[]>();
    data.forEach((item) => {
      const category = String(item[categoryKey] || 'Other');
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(item);
    });

    return Array.from(groups.entries()).map(([name, groupData]) => ({
      name,
      data: groupData,
    }));
  }, [data, categoryKey]);

  // Calculate trend line data
  const trendLineData = React.useMemo(() => {
    if (!showTrendLine) return null;
    return calculateLinearRegression(data, xAxisKey, yAxisKey);
  }, [data, xAxisKey, yAxisKey, showTrendLine]);

  // Check if we should show legend (only when there are multiple meaningful groups)
  const shouldShowLegend = showLegend && groupedData.length > 1;

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="mb-2 text-center text-sm font-medium text-neutral-700">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
          <XAxis
            type="number"
            dataKey={xAxisKey}
            name={xAxisKey}
            tick={{ fill: '#525252', fontSize: 12 }}
            tickLine={{ stroke: '#d4d4d4' }}
          />
          <YAxis
            type="number"
            dataKey={yAxisKey}
            name={yAxisKey}
            tick={{ fill: '#525252', fontSize: 12 }}
          />
          {zAxisKey && (
            <ZAxis
              type="number"
              dataKey={zAxisKey}
              range={[50, 400]}
              name={zAxisKey}
            />
          )}
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
          {shouldShowLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
            />
          )}
          {groupedData.map((group, index) => (
            <Scatter
              key={group.name}
              name={group.name}
              data={group.data}
              fill={colors[index % colors.length]}
            />
          ))}
          {/* Trend Line */}
          {showTrendLine && trendLineData && (
            <Scatter
              name="Trend Line"
              data={trendLineData.points}
              fill="none"
              line={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' }}
              shape={() => null}
              legendType="line"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
