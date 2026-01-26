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
  colors?: string[];
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
  colors = [...CHART_COLORS],
}: ScatterChartComponentProps) {
  // Group data by category if categoryKey is provided
  const groupedData = React.useMemo(() => {
    if (!categoryKey) {
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
          {showLegend && groupedData.length > 1 && (
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
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
