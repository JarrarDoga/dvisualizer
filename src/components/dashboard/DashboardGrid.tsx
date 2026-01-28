'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChartCard } from './ChartCard';
import type { DashboardChart, LayoutItem } from '@/types';

interface DashboardGridProps {
  charts: DashboardChart[];
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
  onRemoveChart: (chartId: string) => void;
  onEditChart?: (chartId: string) => void;
  className?: string;
  editable?: boolean;
}

export function DashboardGrid({
  charts,
  layout,
  onLayoutChange,
  onRemoveChart,
  onEditChart,
  className,
  editable = true,
}: DashboardGridProps) {
  // Simple drag to reorder
  const [draggedId, setDraggedId] = React.useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, chartId: string) => {
    if (!editable) return;
    setDraggedId(chartId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const newLayout = [...layout];
    const draggedIndex = newLayout.findIndex((l) => l.i === draggedId);
    const targetIndex = newLayout.findIndex((l) => l.i === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = newLayout.splice(draggedIndex, 1);
      newLayout.splice(targetIndex, 0, removed);
      onLayoutChange(newLayout);
    }

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  if (charts.length === 0) {
    return (
      <div
        className={cn(
          'flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900',
          className
        )}
      >
        <div className="text-center">
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            No charts added yet
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
            Configure and add charts from the builder above
          </p>
        </div>
      </div>
    );
  }

  // Sort charts by layout order
  const sortedCharts = [...charts].sort((a, b) => {
    const aIndex = layout.findIndex((l) => l.i === a.id);
    const bIndex = layout.findIndex((l) => l.i === b.id);
    return aIndex - bIndex;
  });

  return (
    <div
      className={cn(
        'grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3',
        className
      )}
    >
      {sortedCharts.map((chart) => (
        <div
          key={chart.id}
          draggable={editable}
          onDragStart={(e) => handleDragStart(e, chart.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, chart.id)}
          onDragEnd={handleDragEnd}
          className={cn(
            'min-h-[350px] transition-opacity',
            draggedId === chart.id && 'opacity-50'
          )}
        >
          <ChartCard
            config={chart.config}
            data={chart.data}
            onRemove={editable ? () => onRemoveChart(chart.id) : undefined}
            onEdit={editable && onEditChart ? () => onEditChart(chart.id) : undefined}
            showControls={editable}
            isDragging={draggedId === chart.id}
          />
        </div>
      ))}
    </div>
  );
}
