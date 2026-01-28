'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  BarChart3,
  Upload,
  PieChart,
  Printer,
  Lock,
  Zap,
  ArrowRight,
  FileSpreadsheet,
  FileJson,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const features = [
  {
    icon: Upload,
    title: 'Multiple File Formats',
    description:
      'Support for CSV, Excel (.xlsx, .xls), JSON, TSV, and XML files. Just drag and drop.',
  },
  {
    icon: PieChart,
    title: 'Rich Visualizations',
    description:
      'Bar, Line, Area, Pie, Donut, Scatter, Radar, Treemap, and Funnel charts with customization.',
  },
  {
    icon: Printer,
    title: 'Print Optimized',
    description:
      'Professional print layouts with proper page breaks, clean styling, and PDF export.',
  },
  {
    icon: Lock,
    title: 'Save & Share',
    description:
      'Create an account to save dashboards and share them with public links.',
  },
  {
    icon: Zap,
    title: 'Fast & Responsive',
    description:
      'Client-side file parsing for instant results. Works on any device.',
  },
  {
    icon: BarChart3,
    title: 'Drag & Drop Layout',
    description:
      'Arrange charts freely with an intuitive grid layout. Resize and reorder as needed.',
  },
];

const supportedFormats = [
  { icon: FileSpreadsheet, label: 'Excel (.xlsx, .xls)', color: 'text-green-600 dark:text-green-400' },
  { icon: FileText, label: 'CSV & TSV', color: 'text-blue-600 dark:text-blue-400' },
  { icon: FileJson, label: 'JSON', color: 'text-amber-600 dark:text-amber-400' },
  { icon: FileText, label: 'XML', color: 'text-purple-600 dark:text-purple-400' },
];

export default function HomePage() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session?.user} onSignOut={handleSignOut} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900 py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-5xl lg:text-6xl">
                Visualize Your Data
                <br />
                <span className="text-blue-600 dark:text-blue-400">With Precision</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                Transform spreadsheets and data files into beautiful,
                interactive charts. Create professional dashboards that look
                great on screen and in print.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/visualize">
                  <Button size="lg" className="gap-2">
                    Start Visualizing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>

            {/* Supported formats */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-6">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Supports:
              </span>
              {supportedFormats.map((format) => (
                <div
                  key={format.label}
                  className="flex items-center gap-2 rounded-full bg-white dark:bg-neutral-800 px-4 py-2 shadow-sm dark:shadow-neutral-900/50"
                >
                  <format.icon className={`h-4 w-4 ${format.color}`} />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {format.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-32 bg-neutral-50 dark:bg-neutral-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
                Everything You Need
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                A complete data visualization toolkit designed for professionals
                who value quality and simplicity.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="transition-shadow hover:shadow-md dark:hover:shadow-neutral-900/50"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                      <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-neutral-900 dark:bg-neutral-800 py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to visualize your data?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-300 dark:text-neutral-400">
              No signup required to get started. Upload your file and create
              your first chart in seconds.
            </p>
            <div className="mt-10">
              <Link href="/visualize">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white dark:bg-neutral-100 text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-200"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
