'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Save, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUploader } from '@/components/data/FileUploader';
import { DataPreview } from '@/components/data/DataPreview';
import { ChartBuilder } from '@/components/charts/ChartBuilder';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { ExportMenu } from '@/components/dashboard/ExportMenu';
import type { ParsedData, ChartConfig, DashboardChart, LayoutItem } from '@/types';

export default function VisualizePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const dashboardRef = React.useRef<HTMLDivElement>(null);
  
  const [data, setData] = React.useState<ParsedData | null>(null);
  const [charts, setCharts] = React.useState<DashboardChart[]>([]);
  const [layout, setLayout] = React.useState<LayoutItem[]>([]);
  const [activeTab, setActiveTab] = React.useState('upload');
  
  // Save dialog state
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [dashboardName, setDashboardName] = React.useState('');
  const [dashboardDescription, setDashboardDescription] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const handleDataParsed = (parsedData: ParsedData) => {
    setData(parsedData);
    setActiveTab('preview');
  };

  const handleAddChart = (config: ChartConfig, chartData: Record<string, unknown>[]) => {
    const newChart: DashboardChart = {
      id: config.id,
      config,
      data: chartData,
    };

    setCharts((prev) => [...prev, newChart]);

    const newLayoutItem: LayoutItem = {
      i: config.id,
      x: (charts.length * 4) % 12,
      y: Math.floor(charts.length / 3) * 4,
      w: 4,
      h: 3,
      minW: 2,
      minH: 2,
    };
    setLayout((prev) => [...prev, newLayoutItem]);

    setActiveTab('dashboard');
  };

  const handleRemoveChart = (chartId: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== chartId));
    setLayout((prev) => prev.filter((l) => l.i !== chartId));
  };

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setLayout(newLayout);
  };

  const handleSaveClick = () => {
    if (status === 'unauthenticated') {
      // Store pending dashboard data
      const pendingData = {
        charts,
        layout,
        data: data?.rows,
        fileName: data?.fileName,
      };
      sessionStorage.setItem('pendingDashboard', JSON.stringify(pendingData));
      router.push('/login?callbackUrl=/visualize&pending=true');
      return;
    }
    
    // Show save dialog
    setDashboardName(data?.fileName?.replace(/\.[^/.]+$/, '') || 'My Dashboard');
    setShowSaveDialog(true);
  };

  // Restore pending dashboard after login
  React.useEffect(() => {
    if (status === 'authenticated') {
      const pending = sessionStorage.getItem('pendingDashboard');
      if (pending) {
        try {
          const pendingData = JSON.parse(pending);
          if (pendingData.charts && pendingData.charts.length > 0) {
            setCharts(pendingData.charts);
            setLayout(pendingData.layout || []);
            if (pendingData.data) {
              setData({
                headers: Object.keys(pendingData.data[0] || {}),
                rows: pendingData.data,
                rawData: [],
                fileName: pendingData.fileName || 'Restored Data',
                fileType: 'csv',
                rowCount: pendingData.data.length,
                columnCount: Object.keys(pendingData.data[0] || {}).length,
              });
            }
            setActiveTab('dashboard');
            // Show save dialog automatically
            setDashboardName(pendingData.fileName?.replace(/\.[^/.]+$/, '') || 'My Dashboard');
            setShowSaveDialog(true);
          }
          sessionStorage.removeItem('pendingDashboard');
        } catch (e) {
          console.error('Failed to restore pending dashboard:', e);
          sessionStorage.removeItem('pendingDashboard');
        }
      }
    }
  }, [status]);

  const handleSaveDashboard = async () => {
    if (!dashboardName.trim()) {
      setSaveError('Please enter a dashboard name');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dashboardName.trim(),
          description: dashboardDescription.trim() || undefined,
          config: { charts, layout },
          data: data?.rows,
          isPublic: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save dashboard');
      }

      const savedDashboard = await response.json();
      setShowSaveDialog(false);
      router.push(`/dashboard/${savedDashboard.id}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Create Visualization
              </h1>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                Upload your data file and create interactive charts
              </p>
            </div>

            {charts.length > 0 && (
              <div className="flex items-center gap-2 no-print">
                <ExportMenu
                  targetRef={dashboardRef}
                  fileName={data?.fileName?.replace(/\.[^/.]+$/, '') || 'dashboard'}
                />
                <Button size="sm" onClick={handleSaveClick}>
                  <Save className="mr-2 h-4 w-4" />
                  {status === 'authenticated' ? 'Save Dashboard' : 'Sign in to Save'}
                </Button>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 no-print">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="preview" disabled={!data}>
                Data Preview
              </TabsTrigger>
              <TabsTrigger value="build" disabled={!data}>
                Build Charts
              </TabsTrigger>
              <TabsTrigger value="dashboard" disabled={charts.length === 0}>
                Dashboard ({charts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="no-print">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    onDataParsed={handleDataParsed}
                    onError={(error) => console.error(error)}
                    maxSizeMB={50}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="no-print">
              {data && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Data Preview: {data.fileName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataPreview data={data} maxHeight="500px" />
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => setActiveTab('build')}>
                        Continue to Build Charts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="build" className="no-print">
              {data && (
                <ChartBuilder data={data} onAddChart={handleAddChart} />
              )}
            </TabsContent>

            <TabsContent value="dashboard" id="dashboard-content">
              <div ref={dashboardRef} className="dashboard-export-area bg-white dark:bg-neutral-900 p-4 rounded-lg">
                <DashboardGrid
                  charts={charts}
                  layout={layout}
                  onLayoutChange={handleLayoutChange}
                  onRemoveChart={handleRemoveChart}
                  editable={true}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Dashboard</DialogTitle>
            <DialogDescription>
              Give your dashboard a name to save it to your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {saveError && (
              <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
                {saveError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard Name</Label>
              <Input
                id="name"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="My Dashboard"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={dashboardDescription}
                onChange={(e) => setDashboardDescription(e.target.value)}
                placeholder="A brief description..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDashboard} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
