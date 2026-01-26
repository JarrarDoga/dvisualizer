'use client';

import * as React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/types';

interface RadarChartComponentProps {
  data: Record<string, unknown>[];
  categoryKey: string;
  valueKey: string | string[];
  title?: string;
  showLegend?: boolean;
  fillOpacity?: number;
  colors?: string[];
}

export function RadarChartComponent({
  data,
  categoryKey,
  valueKey,
  title,
  showLegend = true,
  fillOpacity = 0.3,
  colors = [...CHART_COLORS],
}: RadarChartComponentProps) {
  const valueKeys = Array.isArray(valueKey) ? valueKey : [valueKey];

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="mb-2 text-center text-sm font-medium text-neutral-700">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e5e5" />
          <PolarAngleAxis
            dataKey={categoryKey}
            tick={{ fill: '#525252', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 'auto']}
            tick={{ fill: '#737373', fontSize: 10 }}
          />
          {valueKeys.map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={fillOpacity}
            />
          ))}
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
          {showLegend && valueKeys.length > 1 && (
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="rect"
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
