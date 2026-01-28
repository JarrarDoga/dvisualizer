'use client';

import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
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

// Custom render function for percentage labels that works better with export
const renderCustomizedLabel = (props: PieLabelRenderProps): React.ReactElement | null => {
  const { cx, cy, midAngle, outerRadius, percent } = props;
  
  const cxNum = Number(cx ?? 0);
  const cyNum = Number(cy ?? 0);
  const angleNum = Number(midAngle ?? 0);
  const outerRadiusNum = Number(outerRadius ?? 0);
  const percentNum = Number(percent ?? 0);
  
  const RADIAN = Math.PI / 180;
  // Position label outside the pie
  const radius = outerRadiusNum * 1.2;
  const x = cxNum + radius * Math.cos(-angleNum * RADIAN);
  const y = cyNum + radius * Math.sin(-angleNum * RADIAN);

  // Only show label if percent is significant (> 3%)
  if (percentNum < 0.03) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#1f2937"
      textAnchor={x > cxNum ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={14}
      fontWeight={600}
      fontFamily="Arial, sans-serif"
    >
      {`${(percentNum * 100).toFixed(0)}%`}
    </text>
  );
};

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
  // Calculate total for percentage
  const total = React.useMemo(() => {
    return data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0);
  }, [data, valueKey]);

  // Prepare data with percentage
  const dataWithPercent = React.useMemo(() => {
    return data.map(item => ({
      ...item,
      percent: total > 0 ? (Number(item[valueKey]) || 0) / total : 0,
    }));
  }, [data, valueKey, total]);

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
            data={dataWithPercent}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="65%"
            paddingAngle={2}
            label={showLabels ? renderCustomizedLabel : undefined}
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
            formatter={(value) => [String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), 'Value']}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              formatter={(value: string, entry) => {
                const item = dataWithPercent.find(d => d[nameKey] === value);
                const pct = item ? `${(item.percent * 100).toFixed(0)}%` : '';
                return `${value} (${pct})`;
              }}
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
