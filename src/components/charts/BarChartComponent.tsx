'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/types';

interface BarChartComponentProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  yAxisKey: string | string[];
  title?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  layout?: 'horizontal' | 'vertical';
  colors?: string[];
}

export function BarChartComponent({
  data,
  xAxisKey,
  yAxisKey,
  title,
  showGrid = true,
  showLegend = true,
  stacked = false,
  layout = 'horizontal',
  colors = [...CHART_COLORS],
}: BarChartComponentProps) {
  const yAxisKeys = Array.isArray(yAxisKey) ? yAxisKey : [yAxisKey];
  const isVertical = layout === 'vertical';

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="mb-2 text-center text-sm font-medium text-neutral-700">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
          {isVertical ? (
            <>
              <XAxis type="number" tick={{ fill: '#525252', fontSize: 12 }} />
              <YAxis
                dataKey={xAxisKey}
                type="category"
                tick={{ fill: '#525252', fontSize: 12 }}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xAxisKey}
                tick={{ fill: '#525252', fontSize: 12 }}
                tickLine={{ stroke: '#d4d4d4' }}
              />
              <YAxis tick={{ fill: '#525252', fontSize: 12 }} />
            </>
          )}
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
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              stackId={stacked ? 'stack' : undefined}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
