'use client';

import * as React from 'react';
import { parseFile, isSupported, validateFileSize, getFileSizeError } from '@/lib/parsers';
import type { ParsedData } from '@/types';

interface UseFileParserOptions {
  maxSizeMB?: number;
  onSuccess?: (data: ParsedData) => void;
  onError?: (error: string) => void;
}

interface UseFileParserReturn {
  data: ParsedData | null;
  isLoading: boolean;
  error: string | null;
  parseFile: (file: File) => Promise<void>;
  reset: () => void;
}

export function useFileParser(options: UseFileParserOptions = {}): UseFileParserReturn {
  const { maxSizeMB = 50, onSuccess, onError } = options;

  const [data, setData] = React.useState<ParsedData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleParseFile = React.useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      setData(null);

      // Validate file type
      if (!isSupported(file)) {
        const errorMsg = 'Unsupported file type';
        setError(errorMsg);
        onError?.(errorMsg);
        setIsLoading(false);
        return;
      }

      // Validate file size
      if (!validateFileSize(file, maxSizeMB)) {
        const errorMsg = getFileSizeError(file, maxSizeMB) || 'File too large';
        setError(errorMsg);
        onError?.(errorMsg);
        setIsLoading(false);
        return;
      }

      try {
        const parsedData = await parseFile(file);
        setData(parsedData);
        onSuccess?.(parsedData);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to parse file';
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [maxSizeMB, onSuccess, onError]
  );

  const reset = React.useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    parseFile: handleParseFile,
    reset,
  };
}
