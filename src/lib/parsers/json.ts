import type { ParsedData, FileType } from '@/types';

export interface JSONParseOptions {
  arrayPath?: string;
  flattenNested?: boolean;
}

export async function parseJSON(
  file: File,
  options: JSONParseOptions = {}
): Promise<ParsedData> {
  const { arrayPath, flattenNested = true } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let parsed = JSON.parse(content);

        // Navigate to array path if specified
        if (arrayPath) {
          const paths = arrayPath.split('.');
          for (const path of paths) {
            if (parsed && typeof parsed === 'object') {
              parsed = parsed[path];
            } else {
              reject(new Error(`Path "${arrayPath}" not found in JSON`));
              return;
            }
          }
        }

        // Ensure we have an array
        if (!Array.isArray(parsed)) {
          // If it's an object with arrays, try to find the first array
          if (typeof parsed === 'object' && parsed !== null) {
            const arrayKey = Object.keys(parsed).find((key) =>
              Array.isArray(parsed[key])
            );
            if (arrayKey) {
              parsed = parsed[arrayKey];
            } else {
              // Wrap single object in array
              parsed = [parsed];
            }
          } else {
            reject(new Error('JSON must contain an array of objects'));
            return;
          }
        }

        if (parsed.length === 0) {
          reject(new Error('JSON array is empty'));
          return;
        }

        // Flatten nested objects if needed
        const rows = flattenNested
          ? parsed.map((item: unknown) => flattenObject(item as Record<string, unknown>))
          : (parsed as Record<string, unknown>[]);

        // Extract headers from all rows to handle inconsistent objects
        const headerSet = new Set<string>();
        rows.forEach((row: Record<string, unknown>) => {
          Object.keys(row).forEach((key) => headerSet.add(key));
        });
        const headers = Array.from(headerSet);

        // Create raw data array
        const rawData = rows.map((row: Record<string, unknown>) =>
          headers.map((h) => row[h] ?? null)
        );

        resolve({
          headers,
          rows,
          rawData,
          fileName: file.name,
          fileType: 'json' as FileType,
          rowCount: rows.length,
          columnCount: headers.length,
        });
      } catch (error) {
        reject(
          new Error(
            `JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (Array.isArray(value)) {
      // Convert arrays to string representation
      result[newKey] = JSON.stringify(value);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
