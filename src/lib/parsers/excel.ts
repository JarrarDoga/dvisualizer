import * as XLSX from 'xlsx';
import type { ParsedData, FileType } from '@/types';

export interface ExcelParseOptions {
  sheetIndex?: number;
  sheetName?: string;
  header?: boolean;
  range?: string;
}

export async function parseExcel(
  file: File,
  options: ExcelParseOptions = {}
): Promise<ParsedData> {
  const { sheetIndex = 0, sheetName, header = true } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        // Get the sheet
        const targetSheetName =
          sheetName || workbook.SheetNames[sheetIndex];
        
        if (!targetSheetName || !workbook.Sheets[targetSheetName]) {
          reject(new Error('Sheet not found in workbook'));
          return;
        }

        const worksheet = workbook.Sheets[targetSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: header ? undefined : 1,
          defval: null,
          raw: false,
        }) as Record<string, unknown>[];

        if (jsonData.length === 0) {
          reject(new Error('No data found in the Excel file'));
          return;
        }

        // Extract headers
        const headers = Object.keys(jsonData[0] || {});

        // Create raw data array
        const rawData = jsonData.map((row) =>
          headers.map((h) => row[h])
        );

        // Determine file type
        const ext = file.name.split('.').pop()?.toLowerCase();
        const fileType: FileType = ext === 'xls' ? 'xls' : 'xlsx';

        resolve({
          headers,
          rows: jsonData,
          rawData,
          fileName: file.name,
          fileType,
          rowCount: jsonData.length,
          columnCount: headers.length,
        });
      } catch (error) {
        reject(
          new Error(
            `Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export function getSheetNames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(
          new Error(
            `Failed to read sheet names: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}
