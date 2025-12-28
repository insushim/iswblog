'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  Image,
  Search,
  Wand2,
  CheckCircle2,
  Clock,
  Folder,
  Plus,
  BookOpen,
} from 'lucide-react';
import { WORKFLOW_STEPS } from '@/types';

// ============================================================
// Sidebar Component
// ============================================================

export interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { workflow, project, trends, actions } = useBlogStore();

  const quickActions = [
    { label: '새 글 쓰기', icon: Plus, onClick: () => actions.newProject() },
    { label: '트렌드 확인', icon: Sparkles, onClick: () => actions.fetchTrends() },
    { label: '초안 이어쓰기', icon: FileText, onClick: () => {} },
  ];

  const recentProjects = [
    { id: '1', name: '2024 트렌드 분석', date: '2시간 전' },
    { id: '2', name: 'SEO 최적화 가이드', date: '어제' },
    { id: '3', name: '블로그 수익화 전략', date: '3일 전' },
  ];

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 transition-all duration-300',
        collapsed ? 'w-16' : 'w-72',
        className
      )}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className={cn('flex-1 overflow-y-auto', collapsed ? 'px-2' : 'px-4')}>
        {/* Quick Actions */}
        {!collapsed && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              빠른 작업
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="ghost"
                  fullWidth
                  onClick={action.onClick}
                  className="justify-start"
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed Icons */}
        {collapsed && (
          <div className="space-y-2 mb-6">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                size="icon"
                onClick={action.onClick}
                className="w-full"
                title={action.label}
              >
                <action.icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        )}

        {/* Progress Card */}
        {!collapsed && workflow.isGenerating && (
          <Card className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                생성 중...
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
              {workflow.currentTask}
            </p>
            <Progress value={workflow.progress} size="sm" variant="gradient" />
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
              {workflow.progress}% 완료
            </p>
          </Card>
        )}

        {/* Workflow Steps */}
        {!collapsed && workflow.currentStep > 0 && !workflow.isGenerating && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              작업 단계
            </h3>
            <div className="space-y-2">
              {WORKFLOW_STEPS.map(({ step, title }) => {
                const isCompleted = workflow.completedSteps.includes(step);
                const isCurrent = workflow.currentStep === step;
                const isPending = !isCompleted && !isCurrent;

                return (
                  <button
                    key={step}
                    onClick={() => actions.goToStep(step)}
                    disabled={isPending}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors',
                      isCompleted && 'text-green-600 dark:text-green-400',
                      isCurrent && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                      isPending && 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className={cn(
                        'flex items-center justify-center h-4 w-4 rounded-full text-xs border',
                        isCurrent ? 'border-blue-600 text-blue-600' : 'border-current'
                      )}>
                        {step}
                      </span>
                    )}
                    {title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Trending Topics */}
        {!collapsed && trends.suggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              인기 주제
            </h3>
            <div className="space-y-2">
              {trends.suggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => actions.applyTrendSuggestion(suggestion)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-zinc-400">{index + 1}</span>
                  <span className="flex-1 truncate text-zinc-700 dark:text-zinc-300">
                    {suggestion.topic}
                  </span>
                  <Badge variant="success" size="sm">
                    +{suggestion.trendData.growthRate}%
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Projects */}
        {!collapsed && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              최근 프로젝트
            </h3>
            <div className="space-y-1">
              {recentProjects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => actions.loadProject(proj.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Folder className="h-4 w-4 text-zinc-400" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-zinc-700 dark:text-zinc-300">
                      {proj.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      {proj.date}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        {!collapsed && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              통계
            </h3>
            <Card padding="sm" className="bg-white dark:bg-zinc-800">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">12</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">총 글</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">45K</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">총 조회</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <BookOpen className="h-4 w-4" />
            <span>도움말 및 문서</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
