'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

// ============================================================
// Main Layout Component
// ============================================================

export interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function MainLayout({
  children,
  showSidebar = true,
  className,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        {showSidebar && <Sidebar className="hidden md:flex" />}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// Editor Layout (3단 레이아웃)
export interface EditorLayoutProps {
  leftPanel?: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
  bottomBar?: React.ReactNode;
  leftPanelWidth?: string;
  rightPanelWidth?: string;
  leftPanelCollapsible?: boolean;
  rightPanelCollapsible?: boolean;
}

export function EditorLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  bottomBar,
  leftPanelWidth = '280px',
  rightPanelWidth = '320px',
  leftPanelCollapsible = true,
  rightPanelCollapsible = true,
}: EditorLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = React.useState(false);
  const [rightCollapsed, setRightCollapsed] = React.useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        {leftPanel && (
          <div
            className={cn(
              'border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 transition-all duration-300 overflow-hidden',
              leftCollapsed ? 'w-0' : ''
            )}
            style={{ width: leftCollapsed ? 0 : leftPanelWidth }}
          >
            <div className="h-full overflow-y-auto">
              {leftPanel}
            </div>
          </div>
        )}

        {/* Left Panel Toggle */}
        {leftPanel && leftPanelCollapsible && (
          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="flex items-center justify-center w-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-r border-zinc-200 dark:border-zinc-700 transition-colors"
          >
            <svg
              className={cn('w-3 h-3 text-zinc-500 transition-transform', leftCollapsed && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Center Panel */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-zinc-950">
          {centerPanel}
        </div>

        {/* Right Panel Toggle */}
        {rightPanel && rightPanelCollapsible && (
          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="flex items-center justify-center w-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-l border-zinc-200 dark:border-zinc-700 transition-colors"
          >
            <svg
              className={cn('w-3 h-3 text-zinc-500 transition-transform', rightCollapsed && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Right Panel */}
        {rightPanel && (
          <div
            className={cn(
              'border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 transition-all duration-300 overflow-hidden',
              rightCollapsed ? 'w-0' : ''
            )}
            style={{ width: rightCollapsed ? 0 : rightPanelWidth }}
          >
            <div className="h-full overflow-y-auto">
              {rightPanel}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      {bottomBar && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          {bottomBar}
        </div>
      )}
    </div>
  );
}

// Page Container
export interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthStyles = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function PageContainer({
  children,
  title,
  description,
  actions,
  className,
  maxWidth = '2xl',
}: PageContainerProps) {
  return (
    <div className={cn('p-6', maxWidthStyles[maxWidth], 'mx-auto', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default MainLayout;
