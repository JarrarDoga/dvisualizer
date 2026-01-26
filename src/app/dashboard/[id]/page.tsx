'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Header } from '@/components/layout/Header';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import type { Dashboard, DashboardConfig, DashboardChart, LayoutItem } from '@/types';

export default function DashboardViewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const dashboardRef = React.useRef<HTMLDivElement>(null);

  const [dashboard, setDashboard] = React.useState<Dashboard | null>(null);
  const [charts, setCharts] = React.useState<DashboardChart[]>([]);
  const [layout, setLayout] = React.useState<LayoutItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isOwner = dashboard?.userId === session?.user?.id;

  React.useEffect(() => {
    fetchDashboard();
  }, [params.id]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`/api/dashboards/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Dashboard not found');
        } else if (response.status === 401) {
          router.push('/login?callbackUrl=' + encodeURIComponent(`/dashboard/${params.id}`));
          return;
        } else {
          throw new Error('Failed to fetch dashboard');
        }
        return;
      }

      const data = await response.json();
      setDashboard(data);

      // Extract charts and layout from config
      const config = data.config as DashboardConfig;
      setCharts(config.charts || []);
      setLayout(config.layout || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    if (!dashboard) return;
    setDashboard({ ...dashboard, name });
    setHasUnsavedChanges(true);
  };

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setLayout(newLayout);
    setHasUnsavedChanges(true);
  };

  const handleRemoveChart = (chartId: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== chartId));
    setLayout((prev) => prev.filter((l) => l.i !== chartId));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!dashboard || !isOwner) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/dashboards/${dashboard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dashboard.name,
          config: { charts, layout },
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      setHasUnsavedChanges(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    if (!dashboardRef.current) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dataUrl = await toPng(dashboardRef.current, {
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
      link.download = `${dashboard?.name || 'dashboard'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <Header user={session?.user} onSignOut={handleSignOut} />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <Header user={session?.user} onSignOut={handleSignOut} />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-900">{error}</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Go to Dashboards
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header user={session?.user} onSignOut={handleSignOut} />

      <DashboardHeader
        name={dashboard.name}
        onNameChange={handleNameChange}
        onSave={isOwner ? handleSave : undefined}
        onPrint={handlePrint}
        onExport={handleExport}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <main className="flex-1 p-6">
        <div ref={dashboardRef} className="mx-auto max-w-7xl bg-white p-4 print:p-0">
          {/* Print header */}
          <div className="hidden print:block print:mb-6">
            <h1 className="text-2xl font-bold">{dashboard.name}</h1>
            <p className="text-sm text-neutral-500">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>

          <DashboardGrid
            charts={charts}
            layout={layout}
            onLayoutChange={handleLayoutChange}
            onRemoveChart={handleRemoveChart}
            editable={isOwner}
          />
        </div>
      </main>
    </div>
  );
}
