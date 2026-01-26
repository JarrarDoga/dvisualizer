'use client';

import * as React from 'react';
import type { ChartConfig, ChartType } from '@/types';
import { generateId } from '@/lib/utils';

interface UseChartConfigOptions {
  initialConfig?: Partial<ChartConfig>;
}

interface UseChartConfigReturn {
  config: ChartConfig;
  updateConfig: (updates: Partial<ChartConfig>) => void;
  setChartType: (type: ChartType) => void;
  setTitle: (title: string) => void;
  setXAxis: (dataKey: string, label?: string) => void;
  setYAxis: (dataKey: string, label?: string) => void;
  resetConfig: () => void;
}

const defaultConfig: ChartConfig = {
  id: '',
  type: 'bar',
  title: '',
  showLegend: true,
  showGrid: true,
  showTooltip: true,
};

export function useChartConfig(
  options: UseChartConfigOptions = {}
): UseChartConfigReturn {
  const { initialConfig } = options;

  const [config, setConfig] = React.useState<ChartConfig>(() => ({
    ...defaultConfig,
    ...initialConfig,
    id: initialConfig?.id || generateId(),
  }));

  const updateConfig = React.useCallback((updates: Partial<ChartConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const setChartType = React.useCallback((type: ChartType) => {
    setConfig((prev) => ({ ...prev, type }));
  }, []);

  const setTitle = React.useCallback((title: string) => {
    setConfig((prev) => ({ ...prev, title }));
  }, []);

  const setXAxis = React.useCallback((dataKey: string, label?: string) => {
    setConfig((prev) => ({
      ...prev,
      xAxis: { dataKey, label },
    }));
  }, []);

  const setYAxis = React.useCallback((dataKey: string, label?: string) => {
    setConfig((prev) => ({
      ...prev,
      yAxis: { dataKey, label },
    }));
  }, []);

  const resetConfig = React.useCallback(() => {
    setConfig({ ...defaultConfig, id: generateId() });
  }, []);

  return {
    config,
    updateConfig,
    setChartType,
    setTitle,
    setXAxis,
    setYAxis,
    resetConfig,
  };
}
