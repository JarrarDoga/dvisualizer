'use client';

import * as React from 'react';
import html2canvas from 'html2canvas';
import { Download, Printer, FileImage, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportMenuProps {
  targetRef: React.RefObject<HTMLElement | null>;
  fileName?: string;
}

export function ExportMenu({ targetRef, fileName = 'dashboard' }: ExportMenuProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handlePrintDashboard = () => {
    document.body.classList.add('printing-dashboard');
    window.print();
    document.body.classList.remove('printing-dashboard');
  };

  const handleExportPNG = async () => {
    if (!targetRef.current) {
      alert('Nothing to export');
      return;
    }

    setIsExporting(true);

    try {
      // Wait for any animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        ignoreElements: (node) => {
          if (node.classList?.contains('no-print')) return true;
          if (node.tagName === 'BUTTON') return true;
          return false;
        },
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
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
    if (!targetRef.current) {
      alert('Nothing to export');
      return;
    }

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        ignoreElements: (node) => {
          if (node.classList?.contains('no-print')) return true;
          if (node.tagName === 'BUTTON') return true;
          return false;
        },
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `${fileName}.jpg`;
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handlePrintDashboard}>
          <Printer className="mr-2 h-4 w-4" />
          Print Dashboard
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
  );
}

// Component for exporting individual charts
interface ChartExportButtonProps {
  chartRef: React.RefObject<HTMLElement | null>;
  chartName?: string;
}

export function ChartExportButton({ chartRef, chartName = 'chart' }: ChartExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPNG = async () => {
    if (!chartRef.current) return;

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${chartName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!chartRef.current) return;
    
    const printContent = chartRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${chartName}</title>
            <style>
              body { 
                margin: 20px; 
                font-family: system-ui, -apple-system, sans-serif;
              }
              .chart-container {
                max-width: 800px;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <div class="chart-container">${printContent}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isExporting}>
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Chart
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPNG}>
          <FileImage className="mr-2 h-4 w-4" />
          Export as PNG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
