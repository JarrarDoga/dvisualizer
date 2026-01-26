'use client';

import * as React from 'react';
import {
  FunnelChart,
  Funnel,
  Cell,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/types';

interface FunnelChartComponentProps {
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  title?: string;
  showLabels?: boolean;
  colors?: string[];
}

export function FunnelChartComponent({
  data,
  nameKey,
  valueKey,
  title,
  showLabels = true,
  colors = [...CHART_COLORS],
}: FunnelChartComponentProps) {
  // Transform and sort data for funnel (largest to smallest)
  const funnelData = React.useMemo(() => {
    return data
      .map((item) => ({
        name: String(item[nameKey] || ''),
        value: Number(item[valueKey]) || 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [data, nameKey, valueKey]);

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="mb-2 text-center text-sm font-medium text-neutral-700">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            formatter={(value) => value != null ? [value.toLocaleString(), ''] : ['', '']}
          />
          <Funnel
            dataKey="value"
            data={funnelData}
            isAnimationActive
          >
            {showLabels && (
              <LabelList
                position="right"
                fill="#525252"
                stroke="none"
                dataKey="name"
                fontSize={12}
              />
            )}
            {funnelData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}
