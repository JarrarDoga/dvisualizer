'use client';

import * as React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '@/types';

interface TreemapChartComponentProps {
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  title?: string;
  colors?: string[];
}

interface TreemapContentProps {
  root?: { children?: unknown[] };
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: number;
  colors: string[];
}

const CustomizedContent: React.FC<TreemapContentProps> = ({
  depth,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  name,
  value,
  colors,
}) => {
  const fontSize = Math.min(width, height) / 8;
  const showText = width > 50 && height > 30;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#fff',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
      />
      {showText && depth === 1 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - fontSize / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={Math.max(fontSize, 10)}
            fontWeight={500}
          >
            {name && name.length > 15 ? `${name.slice(0, 15)}...` : name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + fontSize / 2 + 4}
            textAnchor="middle"
            fill="#fff"
            fontSize={Math.max(fontSize * 0.8, 9)}
            opacity={0.9}
          >
            {value?.toLocaleString()}
          </text>
        </>
      )}
    </g>
  );
};

export function TreemapChartComponent({
  data,
  nameKey,
  valueKey,
  title,
  colors = [...CHART_COLORS],
}: TreemapChartComponentProps) {
  // Transform data for treemap format
  const treemapData = React.useMemo(() => {
    return data.map((item) => ({
      name: String(item[nameKey] || ''),
      value: Number(item[valueKey]) || 0,
    }));
  }, [data, nameKey, valueKey]);

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="mb-2 text-center text-sm font-medium text-neutral-700">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="value"
          aspectRatio={4 / 3}
          stroke="#fff"
          content={<CustomizedContent colors={colors} />}
        >
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            formatter={(value) => value != null ? [value.toLocaleString(), 'Value'] : ['', 'Value']}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
