'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ChartType, AggregationType } from '@/types';
import { AGGREGATION_LABELS, AGGREGATION_DESCRIPTIONS } from '@/types';
import { detectColumnType } from '@/lib/utils';

interface ColumnMapperProps {
  headers: string[];
  rows: Record<string, unknown>[];
  chartType: ChartType;
  onMappingChange: (mapping: ColumnMapping) => void;
  className?: string;
}

export interface ColumnMapping {
  xAxis?: string;
  yAxis?: string;
  category?: string;
  value?: string;
  series?: string[];
  label?: string;
  aggregation?: AggregationType;
  showTrendLine?: boolean;
}

const NONE_VALUE = '__none__';

const chartRequirements: Record<ChartType, { required: string[]; optional: string[] }> = {
  bar: { required: ['xAxis', 'yAxis'], optional: ['category'] },
  line: { required: ['xAxis', 'yAxis'], optional: ['series'] },
  area: { required: ['xAxis', 'yAxis'], optional: ['series'] },
  pie: { required: ['category', 'value'], optional: ['label'] },
  donut: { required: ['category', 'value'], optional: ['label'] },
  scatter: { required: ['xAxis', 'yAxis'], optional: ['category'] },
  radar: { required: ['category', 'value'], optional: ['series'] },
  treemap: { required: ['category', 'value'], optional: ['label'] },
  funnel: { required: ['category', 'value'], optional: [] },
  composed: { required: ['xAxis', 'yAxis'], optional: ['series'] },
};

const fieldLabels: Record<string, string> = {
  xAxis: 'X-Axis (Categories)',
  yAxis: 'Y-Axis (Values)',
  category: 'Category',
  value: 'Value',
  series: 'Series (Multiple Lines)',
  label: 'Label',
  aggregation: 'Aggregation',
};

const fieldDescriptions: Record<string, string> = {
  xAxis: 'The horizontal axis, typically for categories or time',
  yAxis: 'The vertical axis, typically for numeric values',
  category: 'Groups or categories in your data',
  value: 'Numeric values to visualize',
  series: 'Multiple data series to compare',
  label: 'Labels to display on chart elements',
  aggregation: 'How to combine multiple values per category',
};

// Aggregation options - excluding 'none' from the type for display
const AGGREGATION_OPTIONS: AggregationType[] = [
  'none',
  'sum',
  'average',
  'count',
  'min',
  'max',
  'median',
  'first',
  'last',
];

export function ColumnMapper({
  headers,
  rows,
  chartType,
  onMappingChange,
  className,
}: ColumnMapperProps) {
  const [mapping, setMapping] = React.useState<ColumnMapping>({});
  const [aggregation, setAggregation] = React.useState<AggregationType>('sum');
  const [showTrendLine, setShowTrendLine] = React.useState(false);
  const onMappingChangeRef = React.useRef(onMappingChange);
  const hasInitialized = React.useRef(false);

  // Keep ref updated
  React.useEffect(() => {
    onMappingChangeRef.current = onMappingChange;
  }, [onMappingChange]);

  // Detect column types
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

  // Memoize numeric and categorical columns
  const numericColumns = React.useMemo(
    () => headers.filter((h) => columnTypes[h] === 'number'),
    [headers, columnTypes]
  );
  
  const categoricalColumns = React.useMemo(
    () => headers.filter((h) => columnTypes[h] !== 'number'),
    [headers, columnTypes]
  );

  const requirements = chartRequirements[chartType];

  // Auto-suggest mappings when chart type changes
  React.useEffect(() => {
    const autoMapping: ColumnMapping = {};

    // For X-axis, prefer categorical columns (but for scatter, prefer numeric)
    if (requirements.required.includes('xAxis') || requirements.optional.includes('xAxis')) {
      if (chartType === 'scatter') {
        // Scatter charts need numeric X-axis
        autoMapping.xAxis = numericColumns[0] || headers[0];
      } else {
        autoMapping.xAxis = categoricalColumns[0] || headers[0];
      }
    }

    // For Y-axis, prefer numeric columns
    if (requirements.required.includes('yAxis') || requirements.optional.includes('yAxis')) {
      // For scatter, pick a different numeric column than X
      if (chartType === 'scatter' && numericColumns.length > 1) {
        autoMapping.yAxis = numericColumns[1];
      } else {
        autoMapping.yAxis = numericColumns[0] || headers[1] || headers[0];
      }
    }

    // For category, prefer categorical columns
    // BUT for scatter charts, don't auto-select (leave it as None)
    if (requirements.required.includes('category')) {
      autoMapping.category = categoricalColumns[0] || headers[0];
    } else if (requirements.optional.includes('category') && chartType !== 'scatter') {
      // Only auto-select for non-scatter charts if optional
      autoMapping.category = categoricalColumns[0] || headers[0];
    }
    // For scatter charts, category is intentionally left undefined (None)

    // For value, prefer numeric columns
    if (requirements.required.includes('value') || requirements.optional.includes('value')) {
      autoMapping.value = numericColumns[0] || headers[1] || headers[0];
    }

    // Include current aggregation setting
    autoMapping.aggregation = aggregation;
    
    // Include trend line setting for scatter charts
    if (chartType === 'scatter') {
      autoMapping.showTrendLine = showTrendLine;
    }

    setMapping(autoMapping);
    
    // Use setTimeout to break out of the render cycle
    setTimeout(() => {
      onMappingChangeRef.current(autoMapping);
    }, 0);
    
    hasInitialized.current = true;
  }, [chartType, headers, numericColumns, categoricalColumns, requirements, aggregation, showTrendLine]);

  const handleChange = (field: string, value: string) => {
    const actualValue = value === NONE_VALUE ? undefined : value;
    const newMapping = { ...mapping, [field]: actualValue };
    setMapping(newMapping);
    onMappingChangeRef.current(newMapping);
  };

  const handleAggregationChange = (value: AggregationType) => {
    setAggregation(value);
    const newMapping = { ...mapping, aggregation: value };
    setMapping(newMapping);
    onMappingChangeRef.current(newMapping);
  };

  const handleTrendLineToggle = (checked: boolean) => {
    setShowTrendLine(checked);
    const newMapping = { ...mapping, showTrendLine: checked };
    setMapping(newMapping);
    onMappingChangeRef.current(newMapping);
  };

  const getRecommendedColumns = (field: string): string[] => {
    if (field === 'xAxis' || field === 'category' || field === 'label') {
      return categoricalColumns.length > 0 ? categoricalColumns : headers;
    }
    if (field === 'yAxis' || field === 'value') {
      return numericColumns.length > 0 ? numericColumns : headers;
    }
    return headers;
  };

  const renderField = (field: string, isRequired: boolean) => {
    const recommended = getRecommendedColumns(field);
    const currentValue = mapping[field as keyof ColumnMapping] as string | undefined;

    return (
      <div key={field} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={field} className="text-sm font-medium">
            {fieldLabels[field]}
            {isRequired && <span className="text-red-500">*</span>}
          </Label>
        </div>
        <Select
          value={currentValue || NONE_VALUE}
          onValueChange={(value) => handleChange(field, value)}
        >
          <SelectTrigger id={field} className="w-full">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {!isRequired && (
              <SelectItem value={NONE_VALUE}>
                <span className="text-neutral-400">None</span>
              </SelectItem>
            )}
            {headers.map((col) => (
              <SelectItem key={col} value={col}>
                <div className="flex items-center gap-2">
                  <span>{col}</span>
                  <span className="text-xs text-neutral-400">
                    ({columnTypes[col]})
                  </span>
                  {recommended.includes(col) && recommended.length < headers.length && (
                    <span className="text-xs text-blue-500">recommended</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{fieldDescriptions[field]}</p>
      </div>
    );
  };

  const renderAggregationSelector = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="aggregation" className="text-sm font-medium">
            {fieldLabels.aggregation}
          </Label>
        </div>
        <Select
          value={aggregation}
          onValueChange={(value) => handleAggregationChange(value as AggregationType)}
        >
          <SelectTrigger id="aggregation" className="w-full">
            <SelectValue placeholder="Select aggregation" />
          </SelectTrigger>
          <SelectContent>
            {AGGREGATION_OPTIONS.map((agg) => (
              <SelectItem key={agg} value={agg}>
                <div className="flex flex-col">
                  <span>{AGGREGATION_LABELS[agg]}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {AGGREGATION_DESCRIPTIONS[aggregation]}
        </p>
      </div>
    );
  };

  const renderScatterOptions = () => {
    if (chartType !== 'scatter') return null;

    return (
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Scatter Plot Options
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="trendLine" className="text-sm font-medium">
              Show Trend Line
            </Label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Display a line of best fit through the data points
            </p>
          </div>
          <button
            id="trendLine"
            type="button"
            role="switch"
            aria-checked={showTrendLine}
            onClick={() => handleTrendLineToggle(!showTrendLine)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              showTrendLine ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                showTrendLine ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        {requirements.required.map((field) => renderField(field, true))}
        {requirements.optional.map((field) => renderField(field, false))}
      </div>
      
      {/* Scatter Plot Options */}
      {renderScatterOptions()}
      
      {/* Aggregation Selector */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Data Aggregation
        </h4>
        {renderAggregationSelector()}
      </div>
    </div>
  );
}
