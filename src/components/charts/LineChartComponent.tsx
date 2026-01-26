'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/types';

interface LineChartComponentProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  yAxisKey: string | string[];
  title?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showDots?: boolean;
  curveType?: 'linear' | 'monotone' | 'step';
  colors?: string[];
}

export function LineChartComponent({
  data,
  xAxisKey,
  yAxisKey,
  title,
  showGrid = true,
  showLegend = true,
  showDots = true,
  curveType = 'monotone',
  colors = [...CHART_COLORS],
}: LineChartComponentProps) {
  const yAxisKeys = Array.isArray(yAxisKey) ? yAxisKey : [yAxisKey];

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="mb-2 text-center text-sm font-medium text-neutral-700">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: '#525252', fontSize: 12 }}
            tickLine={{ stroke: '#d4d4d4' }}
          />
          <YAxis tick={{ fill: '#525252', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
          )}
          {yAxisKeys.map((key, index) => (
            <Line
              key={key}
              type={curveType}
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={showDots ? { fill: colors[index % colors.length], r: 4 } : false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
