'use client';

import * as React from 'react';
import { Save, Download, Printer, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
  onSave?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  className?: string;
  showBackLink?: boolean;
}

export function DashboardHeader({
  name,
  onNameChange,
  onSave,
  onExport,
  onPrint,
  onShare,
  isSaving = false,
  hasUnsavedChanges = false,
  className,
  showBackLink = true,
}: DashboardHeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(name);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setEditName(name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    if (editName.trim()) {
      onNameChange(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-4 no-print sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {showBackLink && (
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}

        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-8 w-64 text-lg font-semibold"
            />
          ) : (
            <h1
              onClick={handleStartEdit}
              className="cursor-pointer text-xl font-semibold text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-400"
              title="Click to edit"
            >
              {name}
            </h1>
          )}

          {hasUnsavedChanges && (
            <span className="rounded bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
              Unsaved
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onPrint && (
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}

        {onShare && (
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}

        {onSave && (
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>
    </div>
  );
}
