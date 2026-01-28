'use client';

import * as React from 'react';
import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { CHART_COLORS } from '@/types';

// Color mode options
export type ScatterColorMode = 'single' | 'rainbow';

// Available single colors
export const SCATTER_COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#f97316', label: 'Orange' },
  { value: '#6366f1', label: 'Indigo' },
] as const;

interface ScatterChartComponentProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  yAxisKey: string;
  zAxisKey?: string;
  categoryKey?: string;
  title?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTrendLine?: boolean;
  colorMode?: ScatterColorMode;
  pointColor?: string;
  colors?: string[];
}

// Calculate linear regression for trend line
function calculateLinearRegression(data: Record<string, unknown>[], xKey: string, yKey: string) {
  const points = data
    .map(d => ({ x: Number(d[xKey]), y: Number(d[yKey]) }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y));

  if (points.length < 2) return null;

  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Get min and max X values for the line
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));

  return {
    slope,
    intercept,
    minX,
    maxX,
    startY: slope * minX + intercept,
    endY: slope * maxX + intercept,
  };
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
  showTrendLine = false,
  colorMode = 'single',
  pointColor = '#3b82f6',
  colors = [...CHART_COLORS],
}: ScatterChartComponentProps) {
  // Prepare data with trend line points
  const { chartData, groupedData } = React.useMemo(() => {
    // For rainbow mode with category, group by category
    if (colorMode === 'rainbow' && categoryKey) {
      const uniqueValues = new Set(data.map(item => String(item[categoryKey] || 'Other')));
      
      // Only group if reasonable number of categories
      if (uniqueValues.size <= 10) {
        const groups = new Map<string, Record<string, unknown>[]>();
        data.forEach((item) => {
          const category = String(item[categoryKey] || 'Other');
          if (!groups.has(category)) {
            groups.set(category, []);
          }
          groups.get(category)!.push(item);
        });

        return {
          chartData: data,
          groupedData: Array.from(groups.entries()).map(([name, groupData]) => ({
            name,
            data: groupData,
          })),
        };
      }
    }

    // For rainbow mode without meaningful category, assign colors by index
    if (colorMode === 'rainbow') {
      const coloredData = data.map((item, index) => ({
        ...item,
        __colorIndex: index % colors.length,
      }));
      
      // Group by color index for rainbow effect
      const groups = new Map<number, Record<string, unknown>[]>();
      coloredData.forEach((item) => {
        const colorIdx = item.__colorIndex as number;
        if (!groups.has(colorIdx)) {
          groups.set(colorIdx, []);
        }
        groups.get(colorIdx)!.push(item);
      });

      return {
        chartData: coloredData,
        groupedData: Array.from(groups.entries()).map(([colorIdx, groupData]) => ({
          name: `Series ${colorIdx + 1}`,
          data: groupData,
          colorIndex: colorIdx,
        })),
      };
    }

    // Single color mode - all points same color
    return {
      chartData: data,
      groupedData: [{ name: 'Data', data, colorIndex: 0 }],
    };
  }, [data, categoryKey, colorMode, colors.length]);

  // Calculate trend line data
  const trendLine = React.useMemo(() => {
    if (!showTrendLine) return null;
    return calculateLinearRegression(data, xAxisKey, yAxisKey);
  }, [data, xAxisKey, yAxisKey, showTrendLine]);

  // Prepare trend line data for Line component
  const trendLineChartData = React.useMemo(() => {
    if (!trendLine) return [];
    return [
      { [xAxisKey]: trendLine.minX, trendY: trendLine.startY },
      { [xAxisKey]: trendLine.maxX, trendY: trendLine.endY },
    ];
  }, [trendLine, xAxisKey]);

  // Check if we should show legend
  const shouldShowLegend = showLegend && (groupedData.length > 1 || showTrendLine);

  // Get color for a group
  const getColor = (index: number) => {
    if (colorMode === 'single') return pointColor;
    return colors[index % colors.length];
  };

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="mb-2 text-center text-sm font-medium text-neutral-700">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }} data={trendLineChartData}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
          <XAxis
            type="number"
            dataKey={xAxisKey}
            name={xAxisKey}
            tick={{ fill: '#525252', fontSize: 12 }}
            tickLine={{ stroke: '#d4d4d4' }}
            domain={['dataMin', 'dataMax']}
            allowDataOverflow
          />
          <YAxis
            type="number"
            dataKey={yAxisKey}
            name={yAxisKey}
            tick={{ fill: '#525252', fontSize: 12 }}
            domain={['auto', 'auto']}
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
          {shouldShowLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
            />
          )}
          {/* Scatter points */}
          {groupedData.map((group, index) => (
            <Scatter
              key={group.name}
              name={colorMode === 'rainbow' && groupedData.length > 1 ? '' : 'Data'}
              data={group.data}
              fill={getColor('colorIndex' in group ? (group.colorIndex as number) : index)}
              legendType={colorMode === 'rainbow' && groupedData.length > 1 ? 'none' : 'circle'}
            />
          ))}
          {/* Trend Line */}
          {showTrendLine && trendLine && (
            <Line
              type="linear"
              dataKey="trendY"
              name="Trend Line"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              legendType="line"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
