'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ParsedData } from '@/types';
import { formatNumber, detectColumnType } from '@/lib/utils';

interface DataPreviewProps {
  data: ParsedData;
  className?: string;
  maxHeight?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataPreview({
  data,
  className,
  maxHeight = '400px',
}: DataPreviewProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const { headers, rows } = data;

  // Column type detection
  const columnTypes = React.useMemo(() => {
    return headers.reduce(
      (acc, header) => {
        const values = rows.map((row) => row[header]);
        acc[header] = detectColumnType(values);
        return acc;
      },
      {} as Record<string, string>
    );
  }, [headers, rows]);

  // Sorted rows
  const sortedRows = React.useMemo(() => {
    if (!sortColumn) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [rows, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedRows.length);
  const currentRows = sortedRows.slice(startIndex, endIndex);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      return Number.isInteger(value)
        ? formatNumber(value)
        : value.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className={cn('rounded-lg border border-neutral-200 bg-white', className)}>
      {/* Stats bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-600">
            <span className="font-medium">{formatNumber(data.rowCount)}</span> rows
          </span>
          <span className="text-sm text-neutral-600">
            <span className="font-medium">{data.columnCount}</span> columns
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Rows per page:</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-neutral-50">
            <tr>
              <th className="w-12 border-b border-neutral-200 px-3 py-2 text-left font-medium text-neutral-500">
                #
              </th>
              {headers.map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="cursor-pointer border-b border-neutral-200 px-3 py-2 text-left font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  <div className="flex items-center gap-1">
                    <span className="truncate">{header}</span>
                    <span className="text-xs text-neutral-400">
                      ({columnTypes[header]})
                    </span>
                    {sortColumn === header && (
                      <span className="ml-1 text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, rowIndex) => (
              <tr
                key={startIndex + rowIndex}
                className="hover:bg-neutral-50"
              >
                <td className="border-b border-neutral-100 px-3 py-2 text-neutral-400">
                  {startIndex + rowIndex + 1}
                </td>
                {headers.map((header) => (
                  <td
                    key={header}
                    className="max-w-xs truncate border-b border-neutral-100 px-3 py-2 text-neutral-700"
                    title={formatCellValue(row[header])}
                  >
                    {formatCellValue(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
        <span className="text-sm text-neutral-600">
          Showing {formatNumber(startIndex + 1)} to {formatNumber(endIndex)} of{' '}
          {formatNumber(sortedRows.length)} rows
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="mx-2 text-sm text-neutral-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
