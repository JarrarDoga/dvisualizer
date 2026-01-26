'use client';

import * as React from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { Download, Printer, FileImage, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportControlsProps {
  targetRef: React.RefObject<HTMLElement | null>;
  fileName?: string;
}

export function ExportControls({ targetRef, fileName = 'dashboard' }: ExportControlsProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPNG = async () => {
    if (!targetRef.current) return;

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dataUrl = await toPng(targetRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        filter: (node) => {
          if (node instanceof Element) {
            if (node.classList?.contains('no-print')) return false;
            if (node.tagName === 'BUTTON') return false;
          }
          return true;
        },
      });

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
    if (!targetRef.current) return;

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dataUrl = await toJpeg(targetRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        quality: 0.95,
        cacheBust: true,
        filter: (node) => {
          if (node instanceof Element) {
            if (node.classList?.contains('no-print')) return false;
            if (node.tagName === 'BUTTON') return false;
          }
          return true;
        },
      });

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
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
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
