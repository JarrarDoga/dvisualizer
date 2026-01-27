export interface ParsedData {
  headers: string[];
  rows: Record<string, unknown>[];
  rawData: unknown[][];
  fileName: string;
  fileType: FileType;
  rowCount: number;
  columnCount: number;
}

export type FileType = 'csv' | 'xlsx' | 'xls' | 'json' | 'tsv' | 'xml';

export interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'unknown';
  sampleValues: unknown[];
  nullCount: number;
}

export interface DataStats {
  columns: ColumnInfo[];
  totalRows: number;
  totalColumns: number;
}

export interface FileUploadResult {
  success: boolean;
  data?: ParsedData;
  error?: string;
}

// Aggregation types
export type AggregationType = 
  | 'none'      // No aggregation (raw data)
  | 'sum'       // Sum of values
  | 'average'   // Average (mean) of values
  | 'count'     // Count of records
  | 'min'       // Minimum value
  | 'max'       // Maximum value
  | 'median'    // Median value
  | 'first'     // First value in group
  | 'last';     // Last value in group

export const AGGREGATION_LABELS: Record<AggregationType, string> = {
  none: 'None (Raw Data)',
  sum: 'Sum',
  average: 'Average',
  count: 'Count',
  min: 'Minimum',
  max: 'Maximum',
  median: 'Median',
  first: 'First',
  last: 'Last',
};

export const AGGREGATION_DESCRIPTIONS: Record<AggregationType, string> = {
  none: 'Display raw data without aggregation',
  sum: 'Sum all values for each category',
  average: 'Calculate the average of values',
  count: 'Count the number of records',
  min: 'Show the minimum value',
  max: 'Show the maximum value',
  median: 'Show the median (middle) value',
  first: 'Show the first value in each group',
  last: 'Show the last value in each group',
};
