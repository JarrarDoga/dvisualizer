'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/types';

interface AreaChartComponentProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  yAxisKey: string | string[];
  title?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  curveType?: 'linear' | 'monotone' | 'step';
  colors?: string[];
  fillOpacity?: number;
}

export function AreaChartComponent({
  data,
  xAxisKey,
  yAxisKey,
  title,
  showGrid = true,
  showLegend = true,
  stacked = false,
  curveType = 'monotone',
  colors = [...CHART_COLORS],
  fillOpacity = 0.3,
}: AreaChartComponentProps) {
  const yAxisKeys = Array.isArray(yAxisKey) ? yAxisKey : [yAxisKey];

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="mb-2 text-center text-sm font-medium text-neutral-700">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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
              iconType="rect"
            />
          )}
          {yAxisKeys.map((key, index) => (
            <Area
              key={key}
              type={curveType}
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={fillOpacity}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
