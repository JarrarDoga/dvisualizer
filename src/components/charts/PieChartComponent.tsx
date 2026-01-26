'use client';

import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/types';

interface PieChartComponentProps {
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  title?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  colors?: string[];
}

export function PieChartComponent({
  data,
  nameKey,
  valueKey,
  title,
  showLegend = true,
  showLabels = true,
  innerRadius = 0,
  colors = [...CHART_COLORS],
}: PieChartComponentProps) {
  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="mb-2 text-center text-sm font-medium text-neutral-700">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="80%"
            paddingAngle={2}
            label={showLabels ? ({ percent }) => `${((percent || 0) * 100).toFixed(0)}%` : false}
            labelLine={showLabels}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
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
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Donut chart is just a pie chart with inner radius
export function DonutChartComponent(
  props: Omit<PieChartComponentProps, 'innerRadius'>
) {
  return <PieChartComponent {...props} innerRadius={60} />;
}
