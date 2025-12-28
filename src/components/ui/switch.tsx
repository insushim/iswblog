'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

// ============================================================
// Switch Component (Radix UI based)
// ============================================================

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    root: 'h-4 w-7',
    thumb: 'h-3 w-3 data-[state=checked]:translate-x-3',
  },
  md: {
    root: 'h-5 w-9',
    thumb: 'h-4 w-4 data-[state=checked]:translate-x-4',
  },
  lg: {
    root: 'h-6 w-11',
    thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
  },
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, label, description, size = 'md', id, ...props }, ref) => {
  const switchId = id || React.useId();

  const switchElement = (
    <SwitchPrimitive.Root
      ref={ref}
      id={switchId}
      className={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-zinc-200',
        'dark:focus-visible:ring-offset-zinc-900 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-zinc-700',
        sizeStyles[size].root,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
          'data-[state=unchecked]:translate-x-0',
          sizeStyles[size].thumb
        )}
      />
    </SwitchPrimitive.Root>
  );

  if (label || description) {
    return (
      <div className="flex items-start gap-3">
        {switchElement}
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={switchId}
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return switchElement;
});

Switch.displayName = 'Switch';

// Toggle Group (여러 스위치 그룹)
export interface ToggleGroupProps {
  items: {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }[];
  className?: string;
}

export function ToggleGroup({ items, className }: ToggleGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item) => (
        <Switch
          key={item.id}
          id={item.id}
          label={item.label}
          description={item.description}
          checked={item.checked}
          onCheckedChange={item.onChange}
          disabled={item.disabled}
        />
      ))}
    </div>
  );
}

export { Switch };
