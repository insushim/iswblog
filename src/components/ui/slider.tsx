'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

// ============================================================
// Slider Component (Radix UI based)
// ============================================================

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, label, showValue = false, formatValue, ...props }, ref) => {
  const value = props.value || props.defaultValue || [0];
  const displayValue = formatValue ? formatValue(value[0]) : value[0];

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between mb-2">
          {label && (
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <SliderPrimitive.Range className="absolute h-full bg-blue-600 dark:bg-blue-500" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-600 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-blue-500 dark:bg-zinc-900 dark:ring-offset-zinc-900" />
      </SliderPrimitive.Root>
    </div>
  );
});

Slider.displayName = 'Slider';

// Range Slider (두 개의 핸들)
export interface RangeSliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'value' | 'defaultValue'> {
  label?: string;
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
}

export const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  RangeSliderProps
>(({ className, label, value, defaultValue = [0, 100], onValueChange, formatValue, ...props }, ref) => {
  const currentValue = value || defaultValue;
  const formatDisplay = (val: number) => formatValue ? formatValue(val) : val.toString();

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDisplay(currentValue[0])} - {formatDisplay(currentValue[1])}
          </span>
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        value={currentValue}
        onValueChange={onValueChange as (value: number[]) => void}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <SliderPrimitive.Range className="absolute h-full bg-blue-600 dark:bg-blue-500" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-600 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-blue-500 dark:bg-zinc-900 dark:ring-offset-zinc-900" />
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-600 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-blue-500 dark:bg-zinc-900 dark:ring-offset-zinc-900" />
      </SliderPrimitive.Root>
    </div>
  );
});

RangeSlider.displayName = 'RangeSlider';

export { Slider };
