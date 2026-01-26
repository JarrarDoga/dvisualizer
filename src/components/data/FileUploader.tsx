'use client';

import * as React from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  parseFile,
  isSupported,
  getFileSizeError,
  ACCEPT_FILE_TYPES,
  SUPPORTED_EXTENSIONS,
} from '@/lib/parsers';
import type { ParsedData } from '@/types';

interface FileUploaderProps {
  onDataParsed: (data: ParsedData) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
  className?: string;
}

type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export function FileUploader({
  onDataParsed,
  onError,
  maxSizeMB = 50,
  className,
}: FileUploaderProps) {
  const [status, setStatus] = React.useState<UploadStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleError = (message: string) => {
    setStatus('error');
    setError(message);
    onError?.(message);
  };

  const processFile = async (file: File) => {
    setStatus('uploading');
    setError(null);
    setFileName(file.name);

    // Validate file type
    if (!isSupported(file)) {
      handleError(
        `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`
      );
      return;
    }

    // Validate file size
    const sizeError = getFileSizeError(file, maxSizeMB);
    if (sizeError) {
      handleError(sizeError);
      return;
    }

    try {
      const data = await parseFile(file);
      setStatus('success');
      onDataParsed(data);
    } catch (err) {
      handleError(
        err instanceof Error ? err.message : 'Failed to parse file'
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus('idle');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus('dragging');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus('idle');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleReset = () => {
    setStatus('idle');
    setError(null);
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={status === 'idle' || status === 'error' ? handleClick : undefined}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all',
          status === 'idle' &&
            'cursor-pointer border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
          status === 'dragging' &&
            'border-blue-500 bg-blue-50 dark:bg-blue-950',
          status === 'uploading' &&
            'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50',
          status === 'success' &&
            'border-green-500 bg-green-50 dark:bg-green-950',
          status === 'error' &&
            'cursor-pointer border-red-500 bg-red-50 dark:bg-red-950'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_FILE_TYPES}
          onChange={handleFileSelect}
          className="hidden"
        />

        {status === 'idle' && (
          <>
            <Upload className="mb-4 h-12 w-12 text-neutral-400 dark:text-neutral-500" />
            <p className="mb-1 text-base font-medium text-neutral-700 dark:text-neutral-300">
              Drop your file here or click to browse
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Supports {SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(', ')}
            </p>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              Maximum file size: {maxSizeMB}MB
            </p>
          </>
        )}

        {status === 'dragging' && (
          <>
            <Upload className="mb-4 h-12 w-12 text-blue-500 dark:text-blue-400" />
            <p className="text-base font-medium text-blue-700 dark:text-blue-300">
              Drop your file to upload
            </p>
          </>
        )}

        {status === 'uploading' && (
          <>
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 dark:border-neutral-600 border-t-blue-500" />
            <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">
              Processing {fileName}...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mb-4 h-12 w-12 text-green-500 dark:text-green-400" />
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-base font-medium text-green-700 dark:text-green-300">
                {fileName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="mt-2"
            >
              <X className="mr-1 h-4 w-4" />
              Upload different file
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
            <p className="mb-1 text-base font-medium text-red-700 dark:text-red-300">
              Upload failed
            </p>
            <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Click to try again
            </p>
          </>
        )}
      </div>
    </div>
  );
}
