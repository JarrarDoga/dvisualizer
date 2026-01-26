'use client';

import * as React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartWrapperProps {
  children: React.ReactElement;
  className?: string;
  aspectRatio?: number;
  minHeight?: number;
}

export function ChartWrapper({
  children,
  className,
  aspectRatio,
  minHeight = 300,
}: ChartWrapperProps) {
  return (
    <div
      className={cn('w-full', className)}
      style={{ minHeight, aspectRatio }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
