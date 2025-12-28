'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { WorkflowStep } from '@/types';
import {
  Search,
  FileText,
  Edit3,
  Image,
  BarChart2,
  Sparkles,
  Share2,
  Check,
  Loader2,
  Clock,
  ChevronRight,
} from 'lucide-react';

// ============================================================
// Workflow Stepper Component
// ============================================================

interface StepInfo {
  id: WorkflowStep;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const steps: StepInfo[] = [
  {
    id: 1,
    label: '리서치',
    icon: <Search className="h-5 w-5" />,
    description: '주제 분석 및 자료 수집',
  },
  {
    id: 2,
    label: '아웃라인',
    icon: <FileText className="h-5 w-5" />,
    description: '글 구조 설계',
  },
  {
    id: 3,
    label: '초안 작성',
    icon: <Edit3 className="h-5 w-5" />,
    description: 'AI 글 생성',
  },
  {
    id: 4,
    label: '이미지',
    icon: <Image className="h-5 w-5" />,
    description: '이미지 생성',
  },
  {
    id: 5,
    label: 'SEO',
    icon: <BarChart2 className="h-5 w-5" />,
    description: 'SEO 최적화',
  },
  {
    id: 6,
    label: '휴머나이즈',
    icon: <Sparkles className="h-5 w-5" />,
    description: '자연스러운 표현',
  },
  {
    id: 7,
    label: '검토/발행',
    icon: <Share2 className="h-5 w-5" />,
    description: '최종 검토',
  },
];

export interface WorkflowStepperProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  compact?: boolean;
  onStepClick?: (step: WorkflowStep) => void;
}

export function WorkflowStepper({
  className,
  orientation = 'horizontal',
  compact = false,
  onStepClick,
}: WorkflowStepperProps) {
  const { workflow } = useBlogStore();

  const getStepStatus = (stepId: WorkflowStep): 'completed' | 'current' | 'pending' => {
    if (workflow.completedSteps.includes(stepId)) return 'completed';
    if (stepId === workflow.currentStep) return 'current';
    return 'pending';
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-1', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isClickable = status === 'completed' || status === 'current';

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                status === 'completed' && 'bg-green-50 dark:bg-green-900/20',
                status === 'current' && 'bg-blue-50 dark:bg-blue-900/20',
                status === 'pending' && 'opacity-50',
                isClickable && 'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer',
                !isClickable && 'cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                  status === 'completed' && 'bg-green-500 text-white',
                  status === 'current' && 'bg-blue-500 text-white',
                  status === 'pending' && 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-5 w-5" />
                ) : status === 'current' && workflow.isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-medium text-sm',
                      status === 'completed' && 'text-green-700 dark:text-green-400',
                      status === 'current' && 'text-blue-700 dark:text-blue-400',
                      status === 'pending' && 'text-zinc-500'
                    )}
                  >
                    {step.label}
                  </span>
                  {status === 'current' && workflow.isGenerating && (
                    <Badge variant="default" size="sm">
                      진행 중
                    </Badge>
                  )}
                </div>
                {!compact && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                    {step.description}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </button>
          );
        })}
      </div>
    );
  }

  // Horizontal Layout
  return (
    <div className={cn('relative', className)}>
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{
            width: `${((workflow.completedSteps.length) / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const isClickable = status === 'completed' || status === 'current';

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                'flex flex-col items-center',
                isClickable && 'cursor-pointer',
                !isClickable && 'cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  status === 'completed' && 'bg-green-500 text-white',
                  status === 'current' && 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-800',
                  status === 'pending' && 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-5 w-5" />
                ) : status === 'current' && workflow.isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  step.icon
                )}
              </div>
              {!compact && (
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-xs font-medium',
                      status === 'completed' && 'text-green-600 dark:text-green-400',
                      status === 'current' && 'text-blue-600 dark:text-blue-400',
                      status === 'pending' && 'text-zinc-500'
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Current Step Info Component
export function CurrentStepInfo({ className }: { className?: string }) {
  const { workflow } = useBlogStore();
  const currentStep = steps.find((s) => s.id === workflow.currentStep);

  if (!currentStep) return null;

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
            workflow.isGenerating
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          )}
        >
          {workflow.isGenerating ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            currentStep.icon
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {currentStep.label}
            </h4>
            <Badge variant={workflow.isGenerating ? 'default' : 'secondary'}>
              {workflow.isGenerating ? '진행 중' : '대기'}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {currentStep.description}
          </p>
          {workflow.isGenerating && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>{workflow.currentTask || '처리 중...'}</span>
                <span>{workflow.progress}%</span>
              </div>
              <Progress value={workflow.progress} className="h-1.5" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default WorkflowStepper;
