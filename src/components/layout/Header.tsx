'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string;
  } | null;
  onSignOut?: () => void;
}

const navLinks = [
  { href: '/visualize', label: 'Create' },
  { href: '/dashboard', label: 'Dashboards' },
];

export function Header({ user, onSignOut }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 no-print">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-neutral-900">
            DVisualizer
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-neutral-900',
                pathname === link.href
                  ? 'text-neutral-900'
                  : 'text-neutral-500'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Dashboards
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <nav className="flex flex-col gap-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md bg-neutral-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
