import type { ParsedData, FileType } from '@/types';
import { parseCSV, parseTSV } from './csv';
import { parseExcel } from './excel';
import { parseJSON } from './json';
import { parseXML } from './xml';
import { getFileExtension } from '../utils';

export { parseCSV, parseTSV } from './csv';
export { parseExcel, getSheetNames } from './excel';
export { parseJSON } from './json';
export { parseXML } from './xml';

export const SUPPORTED_FILE_TYPES: Record<string, FileType> = {
  csv: 'csv',
  tsv: 'tsv',
  xlsx: 'xlsx',
  xls: 'xls',
  json: 'json',
  xml: 'xml',
};

export const SUPPORTED_EXTENSIONS = Object.keys(SUPPORTED_FILE_TYPES);

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  csv: 'CSV (Comma-Separated Values)',
  tsv: 'TSV (Tab-Separated Values)',
  xlsx: 'Excel Workbook (.xlsx)',
  xls: 'Excel 97-2003 (.xls)',
  json: 'JSON (JavaScript Object Notation)',
  xml: 'XML (Extensible Markup Language)',
};

export const ACCEPT_FILE_TYPES = SUPPORTED_EXTENSIONS.map(
  (ext) => `.${ext}`
).join(',');

export function getFileType(file: File): FileType | null {
  const ext = getFileExtension(file.name);
  return SUPPORTED_FILE_TYPES[ext] || null;
}

export function isSupported(file: File): boolean {
  return getFileType(file) !== null;
}

export async function parseFile(file: File): Promise<ParsedData> {
  const fileType = getFileType(file);

  if (!fileType) {
    const ext = getFileExtension(file.name);
    throw new Error(
      `Unsupported file type: .${ext}. Supported types: ${SUPPORTED_EXTENSIONS.join(', ')}`
    );
  }

  switch (fileType) {
    case 'csv':
      return parseCSV(file);
    case 'tsv':
      return parseTSV(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    case 'json':
      return parseJSON(file);
    case 'xml':
      return parseXML(file);
    default:
      throw new Error(`Parser not implemented for: ${fileType}`);
  }
}

export function validateFileSize(file: File, maxSizeMB = 50): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

export function getFileSizeError(file: File, maxSizeMB = 50): string | null {
  if (!validateFileSize(file, maxSizeMB)) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return `File size (${sizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`;
  }
  return null;
}
