import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SessionProvider } from '@/components/providers/SessionProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DVisualizer - Data Visualization Dashboard',
  description:
    'Professional data visualization dashboard. Upload CSV, Excel, JSON files and create beautiful, printer-friendly charts and dashboards.',
  keywords: [
    'data visualization',
    'dashboard',
    'charts',
    'CSV',
    'Excel',
    'analytics',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-neutral-50 antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
