'use client';

import * as React from 'react';
import type { DashboardChart, LayoutItem, ChartConfig } from '@/types';
import { generateId } from '@/lib/utils';

interface UseDashboardReturn {
  charts: DashboardChart[];
  layout: LayoutItem[];
  addChart: (config: ChartConfig, data: Record<string, unknown>[]) => void;
  removeChart: (id: string) => void;
  updateChart: (id: string, config: Partial<ChartConfig>) => void;
  updateLayout: (layout: LayoutItem[]) => void;
  clearAll: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [charts, setCharts] = React.useState<DashboardChart[]>([]);
  const [layout, setLayout] = React.useState<LayoutItem[]>([]);

  const addChart = React.useCallback(
    (config: ChartConfig, data: Record<string, unknown>[]) => {
      const id = config.id || generateId();
      const chartWithId: ChartConfig = { ...config, id };

      const newChart: DashboardChart = {
        id,
        config: chartWithId,
        data,
      };

      setCharts((prev) => [...prev, newChart]);

      // Calculate position for new chart
      const maxY = layout.reduce(
        (max, item) => Math.max(max, item.y + item.h),
        0
      );

      const newLayoutItem: LayoutItem = {
        i: id,
        x: 0,
        y: maxY,
        w: 6,
        h: 3,
        minW: 2,
        minH: 2,
      };

      setLayout((prev) => [...prev, newLayoutItem]);
    },
    [layout]
  );

  const removeChart = React.useCallback((id: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
  }, []);

  const updateChart = React.useCallback(
    (id: string, updates: Partial<ChartConfig>) => {
      setCharts((prev) =>
        prev.map((chart) =>
          chart.id === id
            ? { ...chart, config: { ...chart.config, ...updates } }
            : chart
        )
      );
    },
    []
  );

  const updateLayout = React.useCallback((newLayout: LayoutItem[]) => {
    setLayout(newLayout);
  }, []);

  const clearAll = React.useCallback(() => {
    setCharts([]);
    setLayout([]);
  }, []);

  return {
    charts,
    layout,
    addChart,
    removeChart,
    updateChart,
    updateLayout,
    clearAll,
  };
}
