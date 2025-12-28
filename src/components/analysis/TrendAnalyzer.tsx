'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TrendData, TopicSuggestion } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Sparkles,
  ChevronRight,
  Loader2,
  RefreshCw,
  Target,
} from 'lucide-react';

// ============================================================
// Trend Analyzer Component
// ============================================================

export interface TrendAnalyzerProps {
  className?: string;
  onSelectTopic?: (topic: string) => void;
}

export function TrendAnalyzer({ className, onSelectTopic }: TrendAnalyzerProps) {
  const { trends, actions } = useBlogStore();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  React.useEffect(() => {
    if (trends.currentTrends.length === 0 && !trends.isLoading) {
      actions.fetchTrends();
    }
  }, []);

  const filteredTrends = React.useMemo(() => {
    if (selectedCategory === 'all') return trends.currentTrends;
    return trends.currentTrends.filter(
      (t: TrendData) => t.source === selectedCategory
    );
  }, [trends.currentTrends, selectedCategory]);

  const handleSelectSuggestion = (suggestion: TopicSuggestion) => {
    actions.applyTrendSuggestion(suggestion);
    onSelectTopic?.(suggestion.topic);
  };

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'google', label: '구글' },
    { id: 'naver', label: '네이버' },
    { id: 'youtube', label: '유튜브' },
  ];

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            트렌드 분석
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            실시간 인기 키워드 및 주제
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => actions.fetchTrends(selectedCategory !== 'all' ? selectedCategory : undefined)}
          disabled={trends.isLoading}
        >
          {trends.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {trends.isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              트렌드 분석 중...
            </p>
          </div>
        ) : (
          <>
            {/* Hot Trends */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-4 w-4 text-orange-500" />
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  인기 급상승
                </h4>
              </div>
              <div className="space-y-2">
                {filteredTrends.slice(0, 5).map((trend: TrendData, i: number) => (
                  <TrendCard
                    key={trend.keyword}
                    trend={trend}
                    rank={i + 1}
                    onClick={() => onSelectTopic?.(trend.keyword)}
                  />
                ))}
                {filteredTrends.length === 0 && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 py-4 text-center">
                    트렌드 데이터가 없습니다
                  </p>
                )}
              </div>
            </section>

            {/* AI Suggestions */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  AI 추천 주제
                </h4>
              </div>
              <div className="space-y-2">
                {trends.suggestions.slice(0, 5).map((suggestion: TopicSuggestion) => (
                  <SuggestionCard
                    key={suggestion.topic}
                    suggestion={suggestion}
                    onClick={() => handleSelectSuggestion(suggestion)}
                  />
                ))}
                {trends.suggestions.length === 0 && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 py-4 text-center">
                    추천 주제가 없습니다
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// Trend Card Component
interface TrendCardProps {
  trend: TrendData;
  rank: number;
  onClick?: () => void;
}

function TrendCard({ trend, rank, onClick }: TrendCardProps) {
  const getGrowthIcon = (growth: number) => {
    if (growth > 10) return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
    if (growth < -10) return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
    return <Minus className="h-3.5 w-3.5 text-zinc-400" />;
  };

  return (
    <Card
      className="p-3 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {trend.keyword}
            </span>
            {getGrowthIcon(trend.growth)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" size="sm">
              {(trend.volume / 1000).toFixed(1)}K
            </Badge>
            <span
              className={cn(
                'text-xs',
                trend.growth > 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.growth > 0 ? '+' : ''}
              {trend.growth}%
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-400 flex-shrink-0" />
      </div>
    </Card>
  );
}

// Suggestion Card Component
interface SuggestionCardProps {
  suggestion: TopicSuggestion;
  onClick?: () => void;
}

function SuggestionCard({ suggestion, onClick }: SuggestionCardProps) {
  const getDifficultyVariant = (level: 'low' | 'medium' | 'high'): 'success' | 'warning' | 'error' => {
    switch (level) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
    }
  };

  const getDifficultyLabel = (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'low':
        return '쉬움';
      case 'medium':
        return '보통';
      case 'high':
        return '어려움';
    }
  };

  return (
    <Card
      className="p-3 hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {suggestion.title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
            {suggestion.reasoning}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={getDifficultyVariant(suggestion.trendData.competitionLevel)}
              size="sm"
            >
              {getDifficultyLabel(suggestion.trendData.competitionLevel)}
            </Badge>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              예상 트래픽: {(suggestion.estimatedTraffic.monthly / 1000).toFixed(0)}K
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-400 flex-shrink-0" />
      </div>
    </Card>
  );
}

export default TrendAnalyzer;
