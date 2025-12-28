'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Badge Component
// ============================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const variantStyles = {
  default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  outline: 'bg-transparent border border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

const dotColors = {
  default: 'bg-zinc-500',
  primary: 'bg-blue-500',
  secondary: 'bg-purple-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  outline: 'bg-zinc-500',
};

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])}
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

// Badge Group
export interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
  max?: number;
}

export function BadgeGroup({ children, className, max }: BadgeGroupProps) {
  const childArray = React.Children.toArray(children);
  const visibleChildren = max ? childArray.slice(0, max) : childArray;
  const remainingCount = max ? childArray.length - max : 0;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visibleChildren}
      {remainingCount > 0 && (
        <Badge variant="default" size="sm">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

// Status Badge
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away' | 'pending' | 'success' | 'error';
  label?: string;
  className?: string;
}

const statusConfig = {
  online: { color: 'bg-green-500', label: '온라인' },
  offline: { color: 'bg-zinc-400', label: '오프라인' },
  busy: { color: 'bg-red-500', label: '바쁨' },
  away: { color: 'bg-yellow-500', label: '자리비움' },
  pending: { color: 'bg-blue-500', label: '대기중' },
  success: { color: 'bg-green-500', label: '성공' },
  error: { color: 'bg-red-500', label: '오류' },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400',
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', config.color)} />
      {label || config.label}
    </span>
  );
}

// Score Badge
export interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({
  score,
  maxScore = 100,
  size = 'md',
  showLabel = true,
  className,
}: ScoreBadgeProps) {
  const percentage = (score / maxScore) * 100;

  const getVariant = (): BadgeProps['variant'] => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getLabel = (): string => {
    if (percentage >= 90) return '훌륭함';
    if (percentage >= 80) return '좋음';
    if (percentage >= 70) return '양호';
    if (percentage >= 60) return '보통';
    if (percentage >= 50) return '미흡';
    return '개선 필요';
  };

  return (
    <Badge variant={getVariant()} size={size} className={className}>
      {score}점 {showLabel && `(${getLabel()})`}
    </Badge>
  );
}

// Keyword Badge
export interface KeywordBadgeProps {
  keyword: string;
  count?: number;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function KeywordBadge({
  keyword,
  count,
  onRemove,
  onClick,
  className,
}: KeywordBadgeProps) {
  return (
    <Badge
      variant="primary"
      size="md"
      removable={!!onRemove}
      onRemove={onRemove}
      className={cn(onClick && 'cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50', className)}
      onClick={onClick}
    >
      #{keyword}
      {count !== undefined && (
        <span className="ml-1 text-blue-600/70 dark:text-blue-400/70">
          ({count})
        </span>
      )}
    </Badge>
  );
}

export default Badge;
