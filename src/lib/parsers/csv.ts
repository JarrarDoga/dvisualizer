import Papa from 'papaparse';
import type { ParsedData, FileType } from '@/types';

export interface CSVParseOptions {
  delimiter?: string;
  header?: boolean;
  skipEmptyLines?: boolean;
  dynamicTyping?: boolean;
}

export async function parseCSV(
  file: File,
  options: CSVParseOptions = {}
): Promise<ParsedData> {
  const {
    delimiter,
    header = true,
    skipEmptyLines = true,
    dynamicTyping = true,
  } = options;

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      delimiter,
      header,
      skipEmptyLines,
      dynamicTyping,
      complete: (results) => {
        if (results.errors.length > 0) {
          const criticalErrors = results.errors.filter(
            (e) => e.type !== 'FieldMismatch'
          );
          if (criticalErrors.length > 0) {
            reject(new Error(criticalErrors[0].message));
            return;
          }
        }

        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, unknown>[];
        const rawData = rows.map((row) =>
          headers.map((h) => row[h])
        );

        resolve({
          headers,
          rows,
          rawData,
          fileName: file.name,
          fileType: 'csv' as FileType,
          rowCount: rows.length,
          columnCount: headers.length,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

export function parseTSV(
  file: File,
  options: Omit<CSVParseOptions, 'delimiter'> = {}
): Promise<ParsedData> {
  return parseCSV(file, { ...options, delimiter: '\t' }).then((data) => ({
    ...data,
    fileType: 'tsv' as FileType,
  }));
}
