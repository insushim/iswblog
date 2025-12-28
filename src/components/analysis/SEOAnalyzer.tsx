'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Link,
  Hash,
  BarChart2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ============================================================
// SEO Analyzer Component
// ============================================================

export interface SEOAnalyzerProps {
  className?: string;
  onAnalyze?: () => void;
}

// Extended SEO type for UI display
interface SEODisplayData {
  score: number;
  keywordDensity: number;
  keywords: string[];
  readabilityScore: number;
  headingsCount: number;
  paragraphsCount: number;
  imagesCount: number;
  linksCount: number;
  metaDescription: string;
  suggestions: string[];
}

export function SEOAnalyzer({ className, onAnalyze }: SEOAnalyzerProps) {
  const { analysis, workflow, content } = useBlogStore();
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['keywords', 'readability', 'structure'])
  );

  const isAnalyzing = workflow.currentStep === 5 && workflow.isGenerating;

  // Convert SEOAnalysis to display format
  const seo: SEODisplayData | null = analysis.seo
    ? {
        score: analysis.seo.overallScore,
        keywordDensity: analysis.seo.onPage?.keywords?.primary?.density || 0,
        keywords: [
          analysis.seo.onPage?.keywords?.primary?.keyword || '',
          ...(analysis.seo.onPage?.keywords?.secondary?.map((s) => s.keyword) || []),
        ].filter(Boolean),
        readabilityScore: analysis.seo.onPage?.readability?.fleschScore || 0,
        headingsCount: analysis.seo.onPage?.headings?.structure?.length || 0,
        paragraphsCount: Math.floor(analysis.seo.technical?.wordCount / 100) || 0,
        imagesCount: (analysis.seo.technical?.imageAltTexts?.complete || 0) + (analysis.seo.technical?.imageAltTexts?.missing || 0),
        linksCount: (analysis.seo.onPage?.internalLinks?.count || 0) + (analysis.seo.onPage?.externalLinks?.count || 0),
        metaDescription: analysis.seo.onPage?.metaDescription?.current || '',
        suggestions: analysis.seo.prioritizedActions?.map((a) => a.action) || [],
      }
    : null;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const hasContent = content.rawDraft || content.humanizedDraft || content.finalContent;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            SEO 분석
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            검색 엔진 최적화 점수 및 개선 사항
          </p>
        </div>
        {seo && (
          <div className="text-right">
            <span className={cn('text-2xl font-bold', getScoreColor(seo.score))}>
              {seo.score}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">/100</span>
          </div>
        )}
      </div>

      {/* Action */}
      {onAnalyze && (
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <Button
            variant="primary"
            size="sm"
            onClick={onAnalyze}
            disabled={isAnalyzing || !hasContent}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-1" />
                SEO 분석 실행
              </>
            )}
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!seo ? (
          <EmptyState hasContent={!!hasContent} onAnalyze={onAnalyze} />
        ) : (
          <div className="space-y-4">
            {/* Overall Score */}
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl',
                    getScoreBg(seo.score)
                  )}
                >
                  {seo.score}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                    전체 SEO 점수
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {seo.score >= 80
                      ? '우수한 SEO 상태입니다'
                      : seo.score >= 60
                      ? '개선이 필요한 항목이 있습니다'
                      : '많은 개선이 필요합니다'}
                  </p>
                  <Progress value={seo.score} className="mt-2 h-2" />
                </div>
              </div>
            </Card>

            {/* Keywords */}
            <AnalysisSection
              title="키워드 분석"
              icon={<Hash className="h-4 w-4" />}
              isExpanded={expandedSections.has('keywords')}
              onToggle={() => toggleSection('keywords')}
              score={seo.keywordDensity > 0.5 && seo.keywordDensity < 3 ? 85 : 50}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    키워드 밀도
                  </span>
                  <Badge variant={seo.keywordDensity > 0.5 && seo.keywordDensity < 3 ? 'success' : 'warning'}>
                    {seo.keywordDensity.toFixed(1)}%
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    주요 키워드
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {seo.keywords.map((keyword: string, i: number) => (
                      <Badge key={i} variant="secondary" size="sm">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </AnalysisSection>

            {/* Readability */}
            <AnalysisSection
              title="가독성"
              icon={<FileText className="h-4 w-4" />}
              isExpanded={expandedSections.has('readability')}
              onToggle={() => toggleSection('readability')}
              score={seo.readabilityScore}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    가독성 점수
                  </span>
                  <span className={cn('font-medium', getScoreColor(seo.readabilityScore))}>
                    {seo.readabilityScore}점
                  </span>
                </div>
                <Progress value={seo.readabilityScore} className="h-2" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {seo.readabilityScore >= 70
                    ? '문장이 읽기 쉽고 명확합니다.'
                    : '문장을 더 짧고 명확하게 수정하면 좋습니다.'}
                </p>
              </div>
            </AnalysisSection>

            {/* Structure */}
            <AnalysisSection
              title="콘텐츠 구조"
              icon={<BarChart2 className="h-4 w-4" />}
              isExpanded={expandedSections.has('structure')}
              onToggle={() => toggleSection('structure')}
              score={
                seo.headingsCount > 0 && seo.paragraphsCount > 0
                  ? Math.min(90, 50 + seo.headingsCount * 10)
                  : 30
              }
            >
              <div className="grid grid-cols-2 gap-4">
                <StatBox label="제목 수" value={seo.headingsCount} />
                <StatBox label="단락 수" value={seo.paragraphsCount} />
                <StatBox label="이미지 수" value={seo.imagesCount} />
                <StatBox label="링크 수" value={seo.linksCount} />
              </div>
            </AnalysisSection>

            {/* Meta */}
            <AnalysisSection
              title="메타 정보"
              icon={<Link className="h-4 w-4" />}
              isExpanded={expandedSections.has('meta')}
              onToggle={() => toggleSection('meta')}
              score={seo.metaDescription ? 90 : 40}
            >
              <div className="space-y-3">
                {seo.metaDescription ? (
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      메타 설명
                    </p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {seo.metaDescription}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {seo.metaDescription.length}자 (권장: 120-160자)
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    메타 설명이 없습니다. SEO를 위해 추가를 권장합니다.
                  </p>
                )}
              </div>
            </AnalysisSection>

            {/* Issues & Suggestions */}
            <Card className="p-4">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                개선 제안
              </h4>
              <div className="space-y-2">
                {seo.suggestions.map((suggestion: string, i: number) => (
                  <SuggestionItem key={i} suggestion={suggestion} />
                ))}
                {seo.suggestions.length === 0 && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    모든 SEO 항목이 양호합니다!
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Empty State
function EmptyState({
  hasContent,
  onAnalyze,
}: {
  hasContent: boolean;
  onAnalyze?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-zinc-400" />
      </div>
      <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
        SEO 분석 결과가 없습니다
      </h4>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs">
        {hasContent
          ? '콘텐츠의 SEO 상태를 분석하여 개선점을 찾아보세요'
          : '먼저 콘텐츠를 작성해주세요'}
      </p>
      {onAnalyze && hasContent && (
        <Button variant="primary" onClick={onAnalyze}>
          <Search className="h-4 w-4 mr-2" />
          SEO 분석 시작
        </Button>
      )}
    </div>
  );
}

// Analysis Section
interface AnalysisSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  score: number;
  children: React.ReactNode;
}

function AnalysisSection({
  title,
  icon,
  isExpanded,
  onToggle,
  score,
  children,
}: AnalysisSectionProps) {
  const getScoreColor = (s: number): string => {
    if (s >= 80) return 'text-green-600 dark:text-green-400';
    if (s >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="overflow-hidden">
      <button
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">{icon}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium', getScoreColor(score))}>
            {score}점
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-zinc-200 dark:border-zinc-700">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </Card>
  );
}

// Stat Box
function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center">
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

// Suggestion Item
function SuggestionItem({ suggestion }: { suggestion: string }) {
  const isPositive = suggestion.startsWith('✓') || suggestion.includes('좋습니다');
  const isWarning = suggestion.includes('권장') || suggestion.includes('추가');
  const isNegative = suggestion.includes('부족') || suggestion.includes('필요');

  return (
    <div className="flex items-start gap-2 py-2">
      {isPositive ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
      ) : isNegative ? (
        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
      )}
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{suggestion}</p>
    </div>
  );
}

export default SEOAnalyzer;
