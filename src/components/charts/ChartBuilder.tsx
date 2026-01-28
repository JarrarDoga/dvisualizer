'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartTypeSelector } from './ChartTypeSelector';
import { ChartRenderer } from './ChartRenderer';
import { ColumnMapper, type ColumnMapping } from '@/components/data/ColumnMapper';
import type { ChartType, ChartConfig, ParsedData } from '@/types';
import { generateId } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ChartBuilderProps {
  data: ParsedData;
  onAddChart: (config: ChartConfig, chartData: Record<string, unknown>[]) => void;
  className?: string;
}

export function ChartBuilder({ data, onAddChart, className }: ChartBuilderProps) {
  const [chartType, setChartType] = React.useState<ChartType>('bar');
  const [mapping, setMapping] = React.useState<ColumnMapping>({});
  const [title, setTitle] = React.useState('');
  const [showLegend, setShowLegend] = React.useState(true);
  const [showGrid, setShowGrid] = React.useState(true);

  const handleMappingChange = React.useCallback((newMapping: ColumnMapping) => {
    setMapping(newMapping);
  }, []);

  const handleAddChart = () => {
    const config: ChartConfig = {
      id: generateId(),
      type: chartType,
      title: title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      showLegend,
      showGrid,
      xAxis: mapping.xAxis ? { dataKey: mapping.xAxis } : undefined,
      yAxis: mapping.yAxis ? { dataKey: mapping.yAxis } : undefined,
      dataKey: mapping.value,
      nameKey: mapping.category,
      aggregation: mapping.aggregation,
      showTrendLine: mapping.showTrendLine,
    };

    onAddChart(config, data.rows);

    // Reset for next chart
    setTitle('');
  };

  const isValidMapping = React.useMemo(() => {
    const categoryCharts: ChartType[] = ['pie', 'donut', 'treemap', 'funnel', 'radar'];
    
    if (categoryCharts.includes(chartType)) {
      return Boolean(mapping.category && mapping.value);
    }
    return Boolean(mapping.xAxis && mapping.yAxis);
  }, [chartType, mapping]);

  return (
    <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="type" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="type">Type</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="space-y-4">
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  Select Chart Type
                </Label>
                <ChartTypeSelector value={chartType} onChange={setChartType} />
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <ColumnMapper
                headers={data.headers}
                rows={data.rows}
                chartType={chartType}
                onMappingChange={handleMappingChange}
              />
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Chart Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chart title..."
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLegend}
                    onChange={(e) => setShowLegend(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500 dark:bg-neutral-800"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Show Legend</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500 dark:bg-neutral-800"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Show Grid</span>
                </label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button
              onClick={handleAddChart}
              disabled={!isValidMapping}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Chart to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {isValidMapping ? (
              <ChartRenderer
                chartType={chartType}
                data={data.rows}
                mapping={mapping}
                title={title}
                showLegend={showLegend}
                showGrid={showGrid}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-center text-neutral-500 dark:text-neutral-400">
                <div>
                  <p className="mb-2 text-lg font-medium">Configure your chart</p>
                  <p className="text-sm">
                    Select a chart type and map your data columns to see a preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
