import type { ChartConfig } from './charts';

export interface DashboardConfig {
  charts: DashboardChart[];
  layout: LayoutItem[];
  theme?: DashboardTheme;
  printSettings?: PrintSettings;
}

export interface DashboardChart {
  id: string;
  config: ChartConfig;
  data: Record<string, unknown>[];
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface DashboardTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  gridColor?: string;
}

export interface PrintSettings {
  paperSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  showTitle: boolean;
  showDate: boolean;
  showPageNumbers: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  config: DashboardConfig;
  data?: Record<string, unknown>[];
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardSummary {
  id: string;
  name: string;
  description?: string;
  chartCount: number;
  isPublic: boolean;
  updatedAt: Date;
}
