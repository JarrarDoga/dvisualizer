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
