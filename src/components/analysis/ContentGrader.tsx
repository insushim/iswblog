'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Star,
  Sparkles,
  Target,
  MessageSquare,
  Eye,
  Loader2,
  Award,
  ThumbsUp,
  ThumbsDown,
  BarChart2,
} from 'lucide-react';

// ============================================================
// Content Grader Component
// ============================================================

export interface ContentGraderProps {
  className?: string;
  onGrade?: () => void;
}

// UI display type for grade
interface GradeDisplayData {
  overall: number;
  originality: number;
  readability: number;
  engagement: number;
  seoScore: number;
  humanScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export function ContentGrader({ className, onGrade }: ContentGraderProps) {
  const { analysis, workflow, content } = useBlogStore();
  const isGrading = workflow.currentStep === 7 && workflow.isGenerating;

  // Convert ContentGrade to display format
  const grade: GradeDisplayData | null = analysis.contentGrade
    ? {
        overall: analysis.contentGrade.overall,
        originality: analysis.contentGrade.breakdown?.originality || 0,
        readability: analysis.contentGrade.breakdown?.readability || 0,
        engagement: analysis.contentGrade.breakdown?.engagement || 0,
        seoScore: analysis.contentGrade.breakdown?.seo || 0,
        humanScore: 100 - (analysis.contentGrade.predictions?.viralPotential || 50),
        strengths: analysis.contentGrade.actionableInsights
          ?.filter(i => i.impact >= 7)
          .map(i => i.solution) || [],
        weaknesses: analysis.contentGrade.actionableInsights
          ?.filter(i => i.impact < 5)
          .map(i => i.issue) || [],
        suggestions: analysis.contentGrade.actionableInsights
          ?.map(i => `${i.category}: ${i.solution}`) || [],
      }
    : null;

  const hasContent = content.rawDraft || content.humanizedDraft || content.finalContent;

  const getGradeLabel = (score: number): { label: string; color: string } => {
    if (score >= 90) return { label: 'A+', color: 'bg-green-500' };
    if (score >= 85) return { label: 'A', color: 'bg-green-500' };
    if (score >= 80) return { label: 'B+', color: 'bg-blue-500' };
    if (score >= 75) return { label: 'B', color: 'bg-blue-500' };
    if (score >= 70) return { label: 'C+', color: 'bg-yellow-500' };
    if (score >= 65) return { label: 'C', color: 'bg-yellow-500' };
    if (score >= 60) return { label: 'D', color: 'bg-orange-500' };
    return { label: 'F', color: 'bg-red-500' };
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            콘텐츠 품질 평가
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            AI 기반 콘텐츠 품질 분석
          </p>
        </div>
        {grade && (
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl',
              getGradeLabel(grade.overall).color
            )}
          >
            {getGradeLabel(grade.overall).label}
          </div>
        )}
      </div>

      {/* Action */}
      {onGrade && (
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <Button
            variant="primary"
            size="sm"
            onClick={onGrade}
            disabled={isGrading || !hasContent}
          >
            {isGrading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                평가 중...
              </>
            ) : (
              <>
                <Star className="h-4 w-4 mr-1" />
                품질 평가 실행
              </>
            )}
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!grade ? (
          <EmptyState hasContent={!!hasContent} onGrade={onGrade} />
        ) : (
          <div className="space-y-4">
            {/* Overall Score */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl',
                    getGradeLabel(grade.overall).color
                  )}
                >
                  {grade.overall}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      전체 품질 점수
                    </h4>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {grade.overall >= 85
                      ? '우수한 품질의 콘텐츠입니다!'
                      : grade.overall >= 70
                      ? '양호한 품질이지만 개선 여지가 있습니다.'
                      : '콘텐츠 품질 개선이 필요합니다.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Score Categories */}
            <div className="grid grid-cols-2 gap-3">
              <ScoreCard
                icon={<Target className="h-4 w-4" />}
                label="독창성"
                score={grade.originality}
                description="콘텐츠의 독창성과 차별성"
              />
              <ScoreCard
                icon={<MessageSquare className="h-4 w-4" />}
                label="가독성"
                score={grade.readability}
                description="읽기 쉽고 이해하기 쉬움"
              />
              <ScoreCard
                icon={<Eye className="h-4 w-4" />}
                label="참여도"
                score={grade.engagement}
                description="독자의 관심을 끄는 정도"
              />
              <ScoreCard
                icon={<BarChart2 className="h-4 w-4" />}
                label="SEO"
                score={grade.seoScore}
                description="검색 엔진 최적화 수준"
              />
            </div>

            {/* Strengths */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  강점
                </h4>
              </div>
              <ul className="space-y-2">
                {grade.strengths.map((strength: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="text-green-500 mt-1">✓</span>
                    {strength}
                  </li>
                ))}
                {grade.strengths.length === 0 && (
                  <li className="text-sm text-zinc-500 dark:text-zinc-400">
                    분석 중...
                  </li>
                )}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  개선점
                </h4>
              </div>
              <ul className="space-y-2">
                {grade.weaknesses.map((weakness: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="text-red-500 mt-1">•</span>
                    {weakness}
                  </li>
                ))}
                {grade.weaknesses.length === 0 && (
                  <li className="text-sm text-zinc-500 dark:text-zinc-400">
                    개선점이 없습니다!
                  </li>
                )}
              </ul>
            </Card>

            {/* Suggestions */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  개선 제안
                </h4>
              </div>
              <ul className="space-y-2">
                {grade.suggestions.map((suggestion: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="text-purple-500 mt-1">→</span>
                    {suggestion}
                  </li>
                ))}
                {grade.suggestions.length === 0 && (
                  <li className="text-sm text-zinc-500 dark:text-zinc-400">
                    추가 제안 사항이 없습니다.
                  </li>
                )}
              </ul>
            </Card>

            {/* AI Detection */}
            <Card className="p-4 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  AI 탐지 위험도
                </h4>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress
                    value={100 - grade.humanScore}
                    className="h-3"
                  />
                </div>
                <Badge
                  variant={
                    grade.humanScore >= 80
                      ? 'success'
                      : grade.humanScore >= 50
                      ? 'warning'
                      : 'error'
                  }
                >
                  {grade.humanScore >= 80
                    ? '낮음'
                    : grade.humanScore >= 50
                    ? '보통'
                    : '높음'}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                휴먼 스코어: {grade.humanScore}% - {' '}
                {grade.humanScore >= 80
                  ? '자연스러운 글로 판단됩니다.'
                  : '휴머나이즈 기능을 사용하여 자연스럽게 만들 수 있습니다.'}
              </p>
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
  onGrade,
}: {
  hasContent: boolean;
  onGrade?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <Star className="h-8 w-8 text-zinc-400" />
      </div>
      <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
        품질 평가 결과가 없습니다
      </h4>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs">
        {hasContent
          ? 'AI가 콘텐츠의 품질을 다각도로 분석합니다'
          : '먼저 콘텐츠를 작성해주세요'}
      </p>
      {onGrade && hasContent && (
        <Button variant="primary" onClick={onGrade}>
          <Star className="h-4 w-4 mr-2" />
          품질 평가 시작
        </Button>
      )}
    </div>
  );
}

// Score Card
interface ScoreCardProps {
  icon: React.ReactNode;
  label: string;
  score: number;
  description: string;
}

function ScoreCard({ icon, label, score, description }: ScoreCardProps) {
  const getColor = (s: number): string => {
    if (s >= 80) return 'text-green-600 dark:text-green-400';
    if (s >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-zinc-500">{icon}</span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className={cn('text-2xl font-bold', getColor(score))}>
          {score}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">/100</span>
      </div>
      <Progress value={score} className="mt-2 h-1.5" />
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        {description}
      </p>
    </Card>
  );
}

export default ContentGrader;
