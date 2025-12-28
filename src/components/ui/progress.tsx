'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ============================================================
// Progress Components
// ============================================================

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animated?: boolean;
}

const variantStyles = {
  default: 'bg-blue-600 dark:bg-blue-500',
  success: 'bg-green-600 dark:bg-green-500',
  warning: 'bg-yellow-600 dark:bg-yellow-500',
  error: 'bg-red-600 dark:bg-red-500',
  gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant = 'default',
      size = 'md',
      showValue = false,
      animated = true,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className="w-full">
        {showValue && (
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              진행률
            </span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700',
            sizeStyles[size],
            className
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full transition-all duration-300 ease-in-out rounded-full',
              variantStyles[variant],
              animated && 'transition-transform'
            )}
            style={{ width: `${percentage}%` }}
          />
        </ProgressPrimitive.Root>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  label?: string;
  className?: string;
}

const circularVariantColors = {
  default: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
};

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = 'default',
  showValue = true,
  label,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            className="text-zinc-200 dark:text-zinc-700"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <motion.circle
            className={circularVariantColors[variant]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      )}
    </div>
  );
}

// Multi Progress (여러 단계)
export interface MultiProgressProps {
  steps: { label: string; status: 'completed' | 'current' | 'pending' }[];
  className?: string;
}

export function MultiProgress({ steps, className }: MultiProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  step.status === 'completed' && 'bg-blue-600 text-white',
                  step.status === 'current' && 'bg-blue-100 text-blue-600 border-2 border-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-400',
                  step.status === 'pending' && 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
                )}
              >
                {step.status === 'completed' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs text-center max-w-[80px]',
                  step.status === 'current' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-zinc-500 dark:text-zinc-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  step.status === 'completed' ? 'bg-blue-600 dark:bg-blue-500' : 'bg-zinc-200 dark:bg-zinc-700'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Score Progress (점수 표시용)
export interface ScoreProgressProps {
  score: number;
  maxScore?: number;
  label: string;
  description?: string;
  className?: string;
}

export function ScoreProgress({
  score,
  maxScore = 100,
  label,
  description,
  className,
}: ScoreProgressProps) {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  const getVariant = (): ProgressProps['variant'] => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-end mb-1">
        <div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </span>
          {description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {score}
          <span className="text-sm font-normal text-zinc-500">/{maxScore}</span>
        </span>
      </div>
      <Progress value={score} max={maxScore} variant={getVariant()} size="md" />
    </div>
  );
}

export default Progress;
