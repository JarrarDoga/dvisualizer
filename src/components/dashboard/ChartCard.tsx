'use client';

import * as React from 'react';
import { X, GripVertical, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartRenderer } from '@/components/charts/ChartRenderer';
import { ChartModal } from './ChartModal';
import type { ChartConfig } from '@/types';
import type { ColumnMapping } from '@/components/data/ColumnMapper';

interface ChartCardProps {
  config: ChartConfig;
  data: Record<string, unknown>[];
  onRemove?: () => void;
  onEdit?: () => void;
  isDragging?: boolean;
  className?: string;
  showControls?: boolean;
}

export function ChartCard({
  config,
  data,
  onRemove,
  onEdit,
  isDragging = false,
  className,
  showControls = true,
}: ChartCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Convert config to mapping format
  const mapping: ColumnMapping = React.useMemo(() => ({
    xAxis: config.xAxis?.dataKey,
    yAxis: config.yAxis?.dataKey,
    category: config.nameKey,
    value: config.dataKey,
    aggregation: config.aggregation,
  }), [config]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on controls
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <Card
        className={cn(
          'flex h-full flex-col overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-blue-500/50',
          isDragging && 'shadow-lg ring-2 ring-blue-500',
          className
        )}
        onClick={handleCardClick}
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
              {/* Expand button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                title="View fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              
              {/* Remove button */}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="h-7 w-7 text-neutral-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-0">
          <div className="h-full min-h-[200px] pointer-events-none">
            <ChartRenderer
              chartType={config.type}
              data={data}
              mapping={mapping}
              showLegend={config.showLegend}
              showGrid={config.showGrid}
            />
          </div>
        </CardContent>
        
        {/* Click hint */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-0 hover:opacity-100 pointer-events-none">
          <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Maximize2 className="h-3 w-3" />
            Click to expand
          </span>
        </div>
      </Card>

      {/* Fullscreen Modal */}
      <ChartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={config}
        data={data}
        onEdit={onEdit}
      />
    </>
  );
}
