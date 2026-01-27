import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function detectColumnType(
  values: unknown[]
): 'string' | 'number' | 'date' | 'boolean' | 'unknown' {
  const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'unknown';

  const sample = nonNullValues.slice(0, 100);

  // Check for boolean
  const booleanCount = sample.filter(
    (v) => typeof v === 'boolean' || v === 'true' || v === 'false'
  ).length;
  if (booleanCount / sample.length > 0.9) return 'boolean';

  // Check for number
  const numberCount = sample.filter((v) => {
    if (typeof v === 'number') return true;
    if (typeof v === 'string') {
      const parsed = parseFloat(v.replace(/,/g, ''));
      return !isNaN(parsed) && isFinite(parsed);
    }
    return false;
  }).length;
  if (numberCount / sample.length > 0.9) return 'number';

  // Check for date
  const dateCount = sample.filter((v) => {
    if (v instanceof Date) return true;
    if (typeof v === 'string') {
      const date = new Date(v);
      return !isNaN(date.getTime()) && v.match(/\d{4}|\d{1,2}[/-]\d{1,2}/);
    }
    return false;
  }).length;
  if (dateCount / sample.length > 0.9) return 'date';

  return 'string';
}

export function parseNumericValue(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,%]/g, '').replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function downloadFile(content: string | Blob, filename: string, type: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================
// Data Aggregation Utilities
// ============================================

import type { AggregationType } from '@/types';

/**
 * Apply an aggregation function to an array of numeric values
 */
export function applyAggregation(
  values: number[],
  aggregationType: AggregationType
): number {
  if (values.length === 0) return 0;

  const validValues = values.filter((v) => !isNaN(v) && isFinite(v));
  if (validValues.length === 0) return 0;

  switch (aggregationType) {
    case 'none':
      // For 'none', return the first value (shouldn't typically be used)
      return validValues[0];

    case 'sum':
      return validValues.reduce((acc, val) => acc + val, 0);

    case 'average':
      return validValues.reduce((acc, val) => acc + val, 0) / validValues.length;

    case 'count':
      return validValues.length;

    case 'min':
      return Math.min(...validValues);

    case 'max':
      return Math.max(...validValues);

    case 'median':
      const sorted = [...validValues].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;

    case 'first':
      return validValues[0];

    case 'last':
      return validValues[validValues.length - 1];

    default:
      return validValues[0];
  }
}

/**
 * Aggregate data by grouping column
 * @param data - Array of data records
 * @param groupByKey - Column to group by (e.g., category)
 * @param valueKey - Column containing values to aggregate
 * @param aggregationType - Type of aggregation to apply
 * @returns Aggregated data grouped by the groupByKey
 */
export function aggregateData(
  data: Record<string, unknown>[],
  groupByKey: string,
  valueKey: string,
  aggregationType: AggregationType
): Record<string, unknown>[] {
  // If no aggregation needed, return original data
  if (aggregationType === 'none') {
    return data;
  }

  // Group data by the groupByKey
  const groups = new Map<string, number[]>();
  const groupOrder: string[] = []; // Preserve order of first occurrence

  for (const row of data) {
    const groupValue = String(row[groupByKey] ?? 'Unknown');
    const numericValue = parseNumericValue(row[valueKey]);

    if (!groups.has(groupValue)) {
      groups.set(groupValue, []);
      groupOrder.push(groupValue);
    }

    if (numericValue !== null) {
      groups.get(groupValue)!.push(numericValue);
    }
  }

  // Apply aggregation to each group
  const aggregatedData: Record<string, unknown>[] = [];

  for (const groupValue of groupOrder) {
    const values = groups.get(groupValue)!;
    const aggregatedValue = applyAggregation(values, aggregationType);

    aggregatedData.push({
      [groupByKey]: groupValue,
      [valueKey]: aggregatedValue,
    });
  }

  return aggregatedData;
}

/**
 * Aggregate data for XY charts (bar, line, area)
 * Groups by xAxis and aggregates yAxis values
 */
export function aggregateXYData(
  data: Record<string, unknown>[],
  xAxisKey: string,
  yAxisKey: string,
  aggregationType: AggregationType
): Record<string, unknown>[] {
  return aggregateData(data, xAxisKey, yAxisKey, aggregationType);
}
