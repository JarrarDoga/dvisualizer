import * as React from 'react';
import Link from 'next/link';
import { BarChart3, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white no-print">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-neutral-900">DVisualizer</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link href="/visualize" className="hover:text-neutral-900">
              Create
            </Link>
            <Link href="/dashboard" className="hover:text-neutral-900">
              Dashboards
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-neutral-900"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>

          <p className="text-sm text-neutral-500">
            {new Date().getFullYear()} DVisualizer. Open source.
          </p>
        </div>
      </div>
    </footer>
  );
}
