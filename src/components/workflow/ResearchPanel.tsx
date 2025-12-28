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
  ExternalLink,
  Copy,
  Check,
  Loader2,
  TrendingUp,
  FileText,
  Target,
  Users,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

// ============================================================
// Research Panel Component
// ============================================================

export interface ResearchPanelProps {
  className?: string;
  onResearch?: () => void;
}

export function ResearchPanel({ className, onResearch }: ResearchPanelProps) {
  const { research, workflow, input } = useBlogStore();
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['topic', 'keywords']));
  const [copiedIndex, setCopiedIndex] = React.useState<string | null>(null);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyContent = async (content: string, key: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isResearching = workflow.currentStep === 1 && workflow.isGenerating;

  const hasData = research && (
    research.topicAnalysis?.mainTopic ||
    research.keywordResearch?.primaryKeyword ||
    research.audienceInsights?.demographics?.length
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            리서치 결과
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            AI가 수집한 주제 관련 정보
          </p>
        </div>
        {hasData && (
          <Badge variant="success">
            분석 완료
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        {onResearch && (
          <Button
            variant="primary"
            size="sm"
            onClick={onResearch}
            disabled={isResearching || !input.topic}
          >
            {isResearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                리서치 중...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-1" />
                리서치 시작
              </>
            )}
          </Button>
        )}
      </div>

      {/* Progress */}
      {isResearching && (
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                주제 분석 및 자료 수집 중...
              </p>
              <Progress value={workflow.progress} className="mt-2 h-1.5" />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasData ? (
          <EmptyState onResearch={onResearch} />
        ) : (
          <div className="space-y-4">
            {/* Topic Analysis */}
            {research.topicAnalysis && (
              <CollapsibleSection
                title="주제 분석"
                icon={<Target className="h-4 w-4" />}
                isExpanded={expandedSections.has('topic')}
                onToggle={() => toggleSection('topic')}
              >
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">메인 주제</span>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {research.topicAnalysis.mainTopic}
                    </p>
                  </div>
                  {research.topicAnalysis.subTopics?.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">세부 주제</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {research.topicAnalysis.subTopics.map((topic, i) => (
                          <Badge key={i} variant="secondary" size="sm">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">검색 의도</span>
                    <Badge variant="default" className="ml-2">
                      {research.topicAnalysis.searchIntent}
                    </Badge>
                  </div>
                </div>
              </CollapsibleSection>
            )}

            {/* Keyword Research */}
            {research.keywordResearch && (
              <CollapsibleSection
                title="키워드 분석"
                icon={<TrendingUp className="h-4 w-4" />}
                isExpanded={expandedSections.has('keywords')}
                onToggle={() => toggleSection('keywords')}
              >
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">핵심 키워드</span>
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                      {research.keywordResearch.primaryKeyword}
                    </p>
                  </div>
                  {research.keywordResearch.secondaryKeywords?.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">보조 키워드</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {research.keywordResearch.secondaryKeywords.map((kw, i) => (
                          <Badge key={i} variant="secondary" size="sm">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {research.keywordResearch.longTailKeywords?.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">롱테일 키워드</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {research.keywordResearch.longTailKeywords.map((kw, i) => (
                          <Badge key={i} variant="outline" size="sm">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {research.keywordResearch.questionKeywords?.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">질문형 키워드</span>
                      <ul className="mt-1 space-y-1">
                        {research.keywordResearch.questionKeywords.map((q, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <HelpCircle className="h-3 w-3 mt-1 text-blue-500" />
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Audience Insights */}
            {research.audienceInsights && (
              <CollapsibleSection
                title="타겟 오디언스"
                icon={<Users className="h-4 w-4" />}
                isExpanded={expandedSections.has('audience')}
                onToggle={() => toggleSection('audience')}
              >
                <div className="space-y-3">
                  {research.audienceInsights.demographics?.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">인구 특성</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {research.audienceInsights.demographics.map((demo, i) => (
                          <Badge key={i} variant="secondary" size="sm">
                            {demo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {research.audienceInsights.painPoints?.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">고충점</span>
                      <ul className="mt-1 space-y-1">
                        {research.audienceInsights.painPoints.map((point, i) => (
                          <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                            • {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {research.audienceInsights.desiredOutcomes?.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">원하는 결과</span>
                      <ul className="mt-1 space-y-1">
                        {research.audienceInsights.desiredOutcomes.map((outcome, i) => (
                          <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                            • {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Content Angle */}
            {research.contentAngle && (
              <CollapsibleSection
                title="콘텐츠 각도"
                icon={<Lightbulb className="h-4 w-4" />}
                isExpanded={expandedSections.has('angle')}
                onToggle={() => toggleSection('angle')}
              >
                <div className="space-y-3">
                  {research.contentAngle.uniqueValue && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">고유 가치</span>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                        {research.contentAngle.uniqueValue}
                      </p>
                    </div>
                  )}
                  {research.contentAngle.differentiator && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">차별화 포인트</span>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                        {research.contentAngle.differentiator}
                      </p>
                    </div>
                  )}
                  {research.contentAngle.hook && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">훅/도입부</span>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1 italic">
                        "{research.contentAngle.hook}"
                      </p>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Competitor Analysis */}
            {research.topicAnalysis?.competitorAnalysis && (
              <CollapsibleSection
                title="경쟁 분석"
                icon={<FileText className="h-4 w-4" />}
                isExpanded={expandedSections.has('competitor')}
                onToggle={() => toggleSection('competitor')}
              >
                <div className="space-y-3">
                  {research.topicAnalysis.competitorAnalysis.averageWordCount > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">평균 글자 수</span>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {research.topicAnalysis.competitorAnalysis.averageWordCount.toLocaleString()}자
                      </p>
                    </div>
                  )}
                  {research.topicAnalysis.competitorAnalysis.commonStructure?.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">공통 구조</span>
                      <ul className="mt-1 space-y-1">
                        {research.topicAnalysis.competitorAnalysis.commonStructure.map((s, i) => (
                          <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                            {i + 1}. {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {research.topicAnalysis.competitorAnalysis.missingAngles?.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">미다룬 주제 (기회)</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {research.topicAnalysis.competitorAnalysis.missingAngles.map((angle, i) => (
                          <Badge key={i} variant="success" size="sm">
                            {angle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Collapsible Section
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-zinc-200 dark:border-zinc-700">
          <div className="pt-3">
            {children}
          </div>
        </div>
      )}
    </Card>
  );
}

// Empty State
function EmptyState({ onResearch }: { onResearch?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-zinc-400" />
      </div>
      <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
        리서치 결과가 없습니다
      </h4>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs">
        주제에 대한 키워드, 타겟 오디언스, 경쟁 분석 정보를 AI가 자동으로 수집합니다
      </p>
      {onResearch && (
        <Button variant="primary" onClick={onResearch}>
          <Search className="h-4 w-4 mr-2" />
          리서치 시작
        </Button>
      )}
    </div>
  );
}

export default ResearchPanel;
