'use client';

import * as React from 'react';
import { BarChartComponent } from './BarChartComponent';
import { LineChartComponent } from './LineChartComponent';
import { AreaChartComponent } from './AreaChartComponent';
import { PieChartComponent, DonutChartComponent } from './PieChartComponent';
import { ScatterChartComponent } from './ScatterChartComponent';
import { RadarChartComponent } from './RadarChartComponent';
import { TreemapChartComponent } from './TreemapChartComponent';
import { FunnelChartComponent } from './FunnelChartComponent';
import type { ChartType } from '@/types';
import type { ColumnMapping } from '@/components/data/ColumnMapper';
import { aggregateData, aggregateXYData } from '@/lib/utils';

interface ChartRendererProps {
  chartType: ChartType;
  data: Record<string, unknown>[];
  mapping: ColumnMapping;
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
}

export function ChartRenderer({
  chartType,
  data,
  mapping,
  title,
  showLegend = true,
  showGrid = true,
  colors,
}: ChartRendererProps) {
  // Apply aggregation based on chart type and mapping
  const processedData = React.useMemo(() => {
    const aggregationType = mapping.aggregation || 'none';
    
    // Charts that use category/value (pie, donut, treemap, funnel, radar)
    const categoryCharts: ChartType[] = ['pie', 'donut', 'treemap', 'funnel', 'radar'];
    
    if (categoryCharts.includes(chartType)) {
      if (mapping.category && mapping.value) {
        return aggregateData(data, mapping.category, mapping.value, aggregationType);
      }
      return data;
    }
    
    // Charts that use xAxis/yAxis (bar, line, area, scatter, composed)
    if (mapping.xAxis && mapping.yAxis) {
      return aggregateXYData(data, mapping.xAxis, mapping.yAxis, aggregationType);
    }
    
    return data;
  }, [data, mapping, chartType]);

  const commonProps = {
    data: processedData,
    title,
    showLegend,
    colors,
  };

  switch (chartType) {
    case 'bar':
      return (
        <BarChartComponent
          {...commonProps}
          xAxisKey={mapping.xAxis || ''}
          yAxisKey={mapping.yAxis || ''}
          showGrid={showGrid}
        />
      );

    case 'line':
      return (
        <LineChartComponent
          {...commonProps}
          xAxisKey={mapping.xAxis || ''}
          yAxisKey={mapping.yAxis || ''}
          showGrid={showGrid}
        />
      );

    case 'area':
      return (
        <AreaChartComponent
          {...commonProps}
          xAxisKey={mapping.xAxis || ''}
          yAxisKey={mapping.yAxis || ''}
          showGrid={showGrid}
        />
      );

    case 'pie':
      return (
        <PieChartComponent
          {...commonProps}
          nameKey={mapping.category || ''}
          valueKey={mapping.value || ''}
        />
      );

    case 'donut':
      return (
        <DonutChartComponent
          {...commonProps}
          nameKey={mapping.category || ''}
          valueKey={mapping.value || ''}
        />
      );

    case 'scatter':
      return (
        <ScatterChartComponent
          {...commonProps}
          xAxisKey={mapping.xAxis || ''}
          yAxisKey={mapping.yAxis || ''}
          categoryKey={mapping.category}
          showGrid={showGrid}
          showTrendLine={mapping.showTrendLine}
          colorMode={mapping.scatterColorMode}
          pointColor={mapping.scatterPointColor}
        />
      );

    case 'radar':
      return (
        <RadarChartComponent
          {...commonProps}
          categoryKey={mapping.category || ''}
          valueKey={mapping.value || ''}
        />
      );

    case 'treemap':
      return (
        <TreemapChartComponent
          {...commonProps}
          nameKey={mapping.category || ''}
          valueKey={mapping.value || ''}
        />
      );

    case 'funnel':
      return (
        <FunnelChartComponent
          {...commonProps}
          nameKey={mapping.category || ''}
          valueKey={mapping.value || ''}
        />
      );

    case 'composed':
      // For composed, default to showing as a line chart
      return (
        <LineChartComponent
          {...commonProps}
          xAxisKey={mapping.xAxis || ''}
          yAxisKey={mapping.yAxis || ''}
          showGrid={showGrid}
        />
      );

    default:
      return (
        <div className="flex h-full items-center justify-center text-neutral-500">
          Unsupported chart type: {chartType}
        </div>
      );
  }
}
