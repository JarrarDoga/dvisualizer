'use client';

import * as React from 'react';
import {
  BarChart3,
  LineChart,
  AreaChart,
  PieChart,
  CircleDot,
  ScatterChart,
  Radar,
  LayoutGrid,
  Triangle,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { ChartType } from '@/types';
import { CHART_TYPE_LABELS, CHART_TYPE_DESCRIPTIONS } from '@/types';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
  className?: string;
}

const chartIcons: Record<ChartType, React.ElementType> = {
  bar: BarChart3,
  line: LineChart,
  area: AreaChart,
  pie: PieChart,
  donut: CircleDot,
  scatter: ScatterChart,
  radar: Radar,
  treemap: LayoutGrid,
  funnel: Triangle,
  composed: Layers,
};

const chartTypes: ChartType[] = [
  'bar',
  'line',
  'area',
  'pie',
  'donut',
  'scatter',
  'radar',
  'treemap',
  'funnel',
];

export function ChartTypeSelector({
  value,
  onChange,
  className,
}: ChartTypeSelectorProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-3 sm:grid-cols-5', className)}>
      {chartTypes.map((type) => {
        const Icon = chartIcons[type];
        const isSelected = value === type;

        return (
          <Card
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center p-4 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800',
              isSelected && 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-1 ring-blue-500'
            )}
          >
            <Icon
              className={cn(
                'mb-2 h-8 w-8',
                isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500 dark:text-neutral-400'
              )}
            />
            <span
              className={cn(
                'text-xs font-medium',
                isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-600 dark:text-neutral-400'
              )}
            >
              {CHART_TYPE_LABELS[type].replace(' Chart', '')}
            </span>
          </Card>
        );
      })}
    </div>
  );
}

export function ChartTypeList({
  value,
  onChange,
  className,
}: ChartTypeSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {chartTypes.map((type) => {
        const Icon = chartIcons[type];
        const isSelected = value === type;

        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all',
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5',
                isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500 dark:text-neutral-400'
              )}
            />
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-700 dark:text-neutral-300'
                )}
              >
                {CHART_TYPE_LABELS[type]}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {CHART_TYPE_DESCRIPTIONS[type]}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
