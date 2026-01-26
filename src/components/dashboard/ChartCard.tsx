'use client';

import * as React from 'react';
import { X, GripVertical, Download, Printer, FileImage } from 'lucide-react';
import { toPng } from 'html-to-image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChartRenderer } from '@/components/charts/ChartRenderer';
import type { ChartConfig } from '@/types';
import type { ColumnMapping } from '@/components/data/ColumnMapper';

interface ChartCardProps {
  config: ChartConfig;
  data: Record<string, unknown>[];
  onRemove?: () => void;
  isDragging?: boolean;
  className?: string;
  showControls?: boolean;
}

export function ChartCard({
  config,
  data,
  onRemove,
  isDragging = false,
  className,
  showControls = true,
}: ChartCardProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  // Convert config to mapping format
  const mapping: ColumnMapping = React.useMemo(() => ({
    xAxis: config.xAxis?.dataKey,
    yAxis: config.yAxis?.dataKey,
    category: config.nameKey,
    value: config.dataKey,
  }), [config]);

  const chartName = config.title || 'chart';

  const handleExportPNG = async () => {
    if (!chartRef.current) return;

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `${chartName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintChart = () => {
    if (!chartRef.current) return;
    
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      // Clone the chart content
      const chartContent = chartRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${chartName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                padding: 40px;
                font-family: system-ui, -apple-system, sans-serif;
                background: white;
              }
              .chart-container {
                max-width: 100%;
                margin: 0 auto;
              }
              .chart-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px;
                text-align: center;
              }
              .chart-wrapper {
                min-height: 400px;
              }
              svg { max-width: 100%; height: auto; }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="chart-container">
              <div class="chart-title">${chartName}</div>
              <div class="chart-wrapper">${chartContent}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden transition-shadow',
        isDragging && 'shadow-lg ring-2 ring-blue-500',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {showControls && (
            <GripVertical className="h-4 w-4 cursor-grab text-neutral-400 active:cursor-grabbing no-print" />
          )}
          <CardTitle className="text-sm font-medium">
            {config.title || 'Untitled Chart'}
          </CardTitle>
        </div>
        {showControls && (
          <div className="flex items-center gap-1 no-print">
            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePrintChart}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Chart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPNG}>
                  <FileImage className="mr-2 h-4 w-4" />
                  Export as PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Remove button */}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-7 w-7 text-neutral-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        <div ref={chartRef} className="h-full min-h-[200px]">
          <ChartRenderer
            chartType={config.type}
            data={data}
            mapping={mapping}
            showLegend={config.showLegend}
            showGrid={config.showGrid}
          />
        </div>
      </CardContent>
    </Card>
  );
}
