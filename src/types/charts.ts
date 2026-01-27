import type { AggregationType } from './data';

export type ChartType =
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'radar'
  | 'treemap'
  | 'funnel'
  | 'composed';

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  dataKey?: string;
  nameKey?: string;
  valueKey?: string;
  series?: SeriesConfig[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  stacked?: boolean;
  layout?: 'horizontal' | 'vertical';
  aggregation?: AggregationType;
}

export interface AxisConfig {
  dataKey: string;
  label?: string;
  tickFormatter?: string;
  domain?: [number | 'auto', number | 'auto'];
}

export interface SeriesConfig {
  dataKey: string;
  name?: string;
  color?: string;
  type?: 'monotone' | 'linear' | 'step';
}

export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
] as const;

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  bar: 'Bar Chart',
  line: 'Line Chart',
  area: 'Area Chart',
  pie: 'Pie Chart',
  donut: 'Donut Chart',
  scatter: 'Scatter Plot',
  radar: 'Radar Chart',
  treemap: 'Treemap',
  funnel: 'Funnel Chart',
  composed: 'Composed Chart',
};

export const CHART_TYPE_DESCRIPTIONS: Record<ChartType, string> = {
  bar: 'Compare categories with rectangular bars',
  line: 'Show trends over time or continuous data',
  area: 'Display cumulative totals over time',
  pie: 'Show proportions of a whole',
  donut: 'Pie chart with center cut out',
  scatter: 'Show correlation between two variables',
  radar: 'Compare multiple variables on axes',
  treemap: 'Display hierarchical data as nested rectangles',
  funnel: 'Show progressive reduction of data',
  composed: 'Combine multiple chart types',
};
