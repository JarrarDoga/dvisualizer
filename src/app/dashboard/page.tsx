'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Plus, Trash2, ExternalLink, Lock, Globe, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface DashboardSummary {
  id: string;
  name: string;
  description?: string;
  chartCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dashboards, setDashboards] = React.useState<DashboardSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard');
      return;
    }

    if (status === 'authenticated') {
      fetchDashboards();
    }
  }, [status, router]);

  const fetchDashboards = async () => {
    try {
      const response = await fetch('/api/dashboards');
      if (!response.ok) throw new Error('Failed to fetch dashboards');
      const data = await response.json();
      setDashboards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;

    try {
      const response = await fetch(`/api/dashboards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete dashboard');

      setDashboards((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <Header user={session?.user} onSignOut={handleSignOut} />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header user={session?.user} onSignOut={handleSignOut} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                My Dashboards
              </h1>
              <p className="mt-1 text-neutral-600">
                Manage and view your saved dashboards
              </p>
            </div>

            <Link href="/visualize">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Dashboard
              </Button>
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {dashboards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 rounded-full bg-neutral-100 p-4">
                  <Plus className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900">
                  No dashboards yet
                </h3>
                <p className="mt-1 text-neutral-600">
                  Create your first dashboard by uploading a data file.
                </p>
                <Link href="/visualize" className="mt-4">
                  <Button>Create Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboards.map((dashboard) => (
                <Card
                  key={dashboard.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {dashboard.name}
                        </CardTitle>
                        {dashboard.description && (
                          <CardDescription className="mt-1 line-clamp-2">
                            {dashboard.description}
                          </CardDescription>
                        )}
                      </div>
                      <span title={dashboard.isPublic ? 'Public' : 'Private'}>
                        {dashboard.isPublic ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-neutral-400" />
                        )}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center gap-4 text-sm text-neutral-500">
                      <span>{dashboard.chartCount} charts</span>
                      <span>Updated {formatDate(dashboard.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/${dashboard.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(dashboard.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
