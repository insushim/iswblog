'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PillTabs } from '@/components/ui/tabs';
import {
  Edit3,
  Loader2,
  Check,
  RefreshCw,
  Copy,
  Wand2,
  Eye,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// ============================================================
// Draft Panel Component
// ============================================================

type ViewTab = 'original' | 'optimized' | 'humanized';

export interface DraftPanelProps {
  className?: string;
  onGenerateDraft?: () => void;
  onOptimize?: () => void;
  onHumanize?: () => void;
}

export function DraftPanel({
  className,
  onGenerateDraft,
  onOptimize,
  onHumanize,
}: DraftPanelProps) {
  const { content, workflow, input, outline } = useBlogStore();
  const [activeTab, setActiveTab] = React.useState<ViewTab>('original');
  const [copied, setCopied] = React.useState(false);

  const isDrafting = workflow.currentStep === 3 && workflow.isGenerating;
  const isOptimizing = workflow.currentStep === 5 && workflow.isGenerating;
  const isHumanizing = workflow.currentStep === 6 && workflow.isGenerating;

  const currentContent = React.useMemo(() => {
    switch (activeTab) {
      case 'original':
        return content.rawDraft;
      case 'optimized':
        return content.humanizedDraft;
      case 'humanized':
        return content.finalContent || content.humanizedDraft;
      default:
        return content.rawDraft;
    }
  }, [activeTab, content]);

  const wordCount = currentContent.replace(/<[^>]+>/g, '').length;
  const estimatedReadingTime = Math.ceil(wordCount / 500);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = outline?.structure?.sections || [];
  const canGenerateDraft = sections.length > 0 && input.topic;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            초안 작성
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            AI가 생성한 블로그 콘텐츠
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {wordCount.toLocaleString()}자
          </Badge>
          <Badge variant="default">
            약 {estimatedReadingTime}분
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <PillTabs
          tabs={[
            {
              id: 'original',
              label: '원본',
            },
            {
              id: 'optimized',
              label: 'SEO 최적화',
              disabled: !content.humanizedDraft,
            },
            {
              id: 'humanized',
              label: '휴머나이즈',
              disabled: !content.finalContent,
            },
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as ViewTab)}
          size="sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-4 border-b border-zinc-200 dark:border-zinc-800">
        {activeTab === 'original' && onGenerateDraft && (
          <Button
            variant="primary"
            size="sm"
            onClick={onGenerateDraft}
            disabled={isDrafting || !canGenerateDraft}
          >
            {isDrafting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-1" />
                초안 생성
              </>
            )}
          </Button>
        )}

        {activeTab === 'original' && content.rawDraft && onOptimize && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOptimize}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                최적화 중...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-1" />
                SEO 최적화
                <ArrowRight className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        )}

        {activeTab === 'optimized' && content.humanizedDraft && onHumanize && (
          <Button
            variant="primary"
            size="sm"
            onClick={onHumanize}
            disabled={isHumanizing}
          >
            {isHumanizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                휴머나이즈
                <ArrowRight className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        )}

        <div className="flex-1" />

        {currentContent && (
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                복사
              </>
            )}
          </Button>
        )}
      </div>

      {/* Progress */}
      {(isDrafting || isOptimizing || isHumanizing) && (
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {isDrafting && '초안 작성 중...'}
                {isOptimizing && 'SEO 최적화 중...'}
                {isHumanizing && '휴머나이즈 처리 중...'}
              </p>
              <Progress value={workflow.progress} className="mt-2 h-1.5" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentContent ? (
          <div
            className="prose prose-zinc dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: currentContent }}
          />
        ) : (
          <EmptyState
            tab={activeTab}
            canGenerate={!!canGenerateDraft}
            onGenerate={onGenerateDraft}
          />
        )}
      </div>

      {/* Version Comparison (if multiple versions exist) */}
      {content.rawDraft && (content.humanizedDraft || content.finalContent) && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <VersionBadge
                label="원본"
                active={activeTab === 'original'}
                wordCount={content.rawDraft.replace(/<[^>]+>/g, '').length}
                onClick={() => setActiveTab('original')}
              />
              {content.humanizedDraft && (
                <>
                  <ArrowRight className="h-4 w-4 text-zinc-400" />
                  <VersionBadge
                    label="SEO"
                    active={activeTab === 'optimized'}
                    wordCount={content.humanizedDraft.replace(/<[^>]+>/g, '').length}
                    onClick={() => setActiveTab('optimized')}
                  />
                </>
              )}
              {content.finalContent && (
                <>
                  <ArrowRight className="h-4 w-4 text-zinc-400" />
                  <VersionBadge
                    label="최종"
                    active={activeTab === 'humanized'}
                    wordCount={content.finalContent.replace(/<[^>]+>/g, '').length}
                    onClick={() => setActiveTab('humanized')}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Empty State
function EmptyState({
  tab,
  canGenerate,
  onGenerate,
}: {
  tab: ViewTab;
  canGenerate: boolean;
  onGenerate?: () => void;
}) {
  const messages = {
    original: {
      title: '초안이 없습니다',
      description: '아웃라인을 기반으로 AI가 초안을 작성합니다',
      action: '초안 생성',
    },
    optimized: {
      title: 'SEO 최적화 버전이 없습니다',
      description: '원본 초안을 먼저 생성해주세요',
      action: null,
    },
    humanized: {
      title: '휴머나이즈 버전이 없습니다',
      description: 'SEO 최적화를 먼저 진행해주세요',
      action: null,
    },
  };

  const msg = messages[tab];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <Edit3 className="h-8 w-8 text-zinc-400" />
      </div>
      <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
        {msg.title}
      </h4>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs">
        {msg.description}
      </p>
      {msg.action && onGenerate && (
        <Button variant="primary" onClick={onGenerate} disabled={!canGenerate}>
          <Edit3 className="h-4 w-4 mr-2" />
          {msg.action}
        </Button>
      )}
    </div>
  );
}

// Version Badge
function VersionBadge({
  label,
  active,
  wordCount,
  onClick,
}: {
  label: string;
  active: boolean;
  wordCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
        active
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
      )}
    >
      <span className="font-medium">{label}</span>
      <span className="text-xs opacity-70">{wordCount.toLocaleString()}자</span>
    </button>
  );
}

export default DraftPanel;
