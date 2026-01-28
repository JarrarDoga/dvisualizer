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
            outerRadius="70%"
            paddingAngle={2}
            label={showLabels ? ({ 
              cx, 
              cy, 
              midAngle, 
              innerRadius, 
              outerRadius, 
              percent 
            }: {
              cx?: number;
              cy?: number;
              midAngle?: number;
              innerRadius?: number;
              outerRadius?: number;
              percent?: number;
            }) => {
              const RADIAN = Math.PI / 180;
              const angle = midAngle ?? 0;
              const radius = Number(innerRadius ?? 0) + (Number(outerRadius ?? 0) - Number(innerRadius ?? 0)) * 1.4;
              const x = Number(cx ?? 0) + radius * Math.cos(-angle * RADIAN);
              const y = Number(cy ?? 0) + radius * Math.sin(-angle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="#374151"
                  textAnchor={x > Number(cx ?? 0) ? 'start' : 'end'}
                  dominantBaseline="central"
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: 500,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  {`${((percent ?? 0) * 100).toFixed(0)}%`}
                </text>
              );
            } : false}
            labelLine={showLabels ? {
              stroke: '#9ca3af',
              strokeWidth: 1,
            } : false}
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
