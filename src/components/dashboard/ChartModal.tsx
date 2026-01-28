'use client';

import * as React from 'react';
import { X, Download, Printer, FileImage, FileText, Edit } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChartRenderer } from '@/components/charts/ChartRenderer';
import type { ChartConfig } from '@/types';
import type { ColumnMapping } from '@/components/data/ColumnMapper';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ChartConfig;
  data: Record<string, unknown>[];
  onEdit?: () => void;
}

export function ChartModal({
  isOpen,
  onClose,
  config,
  data,
  onEdit,
}: ChartModalProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  // Convert config to mapping format
  const mapping: ColumnMapping = React.useMemo(() => ({
    xAxis: config.xAxis?.dataKey,
    yAxis: config.yAxis?.dataKey,
    category: config.nameKey,
    value: config.dataKey,
    aggregation: config.aggregation,
    showTrendLine: config.showTrendLine,
    scatterColorMode: config.scatterColorMode,
    scatterPointColor: config.scatterPointColor,
  }), [config]);

  const chartName = config.title || 'chart';
  const sanitizedName = chartName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');

  const handleExportPNG = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `${sanitizedName}.png`;
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

  const handleExportJPEG = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toJpeg(chartRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        quality: 0.95,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `${sanitizedName}.jpg`;
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

  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        cacheBust: true,
      });

      // Create a print window with the image for PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${chartName}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  padding: 20px;
                  font-family: system-ui, -apple-system, sans-serif;
                  background: white;
                }
                .container {
                  text-align: center;
                  max-width: 100%;
                }
                h1 {
                  font-size: 24px;
                  margin-bottom: 20px;
                  color: #1f2937;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  border-radius: 8px;
                }
                @media print {
                  body { padding: 0; }
                  img { box-shadow: none; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>${chartName}</h1>
                <img src="${dataUrl}" alt="${chartName}" />
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    handleExportPDF();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <DialogTitle className="text-lg font-semibold">
            {config.title || 'Untitled Chart'}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Chart
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting}>
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print / Save as PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportPNG}>
                  <FileImage className="mr-2 h-4 w-4" />
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJPEG}>
                  <FileImage className="mr-2 h-4 w-4" />
                  Export as JPEG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-auto">
          <div 
            ref={chartRef} 
            className="h-full min-h-[400px] bg-white dark:bg-neutral-900 rounded-lg p-4"
          >
            <ChartRenderer
              chartType={config.type}
              data={data}
              mapping={mapping}
              showLegend={config.showLegend}
              showGrid={config.showGrid}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
