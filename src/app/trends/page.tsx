'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBlogStore } from '@/stores/blogStore';
import type { TrendData, TopicSuggestion } from '@/types';
import {
  TrendingUp,
  Wand2,
  Sparkles,
  ChevronRight,
  Clock,
  Flame,
  BarChart2,
} from 'lucide-react';

// ============================================================
// Trends Page
// ============================================================

// Extended type for UI display
interface ExtendedTrendData extends TrendData {
  category?: string;
  description?: string;
}

interface ExtendedTopicSuggestion extends TopicSuggestion {
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function TrendsPage() {
  const { trends, actions } = useBlogStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [trendData, setTrendData] = React.useState<ExtendedTrendData[]>([]);
  const [suggestions, setSuggestions] = React.useState<ExtendedTopicSuggestion[]>([]);

  React.useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trends');
      const data = await response.json();

      if (data.success) {
        setTrendData(data.trends || []);
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTopic = (topic: ExtendedTopicSuggestion) => {
    actions.setInput('topic', topic.topic);
    actions.setInput('title', topic.title);
    actions.setInput('keywords', topic.relatedKeywords || []);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              트렌드 분석
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              실시간 인기 주제와 키워드를 확인하세요
            </p>
          </div>
          <div className="flex items-center gap-3">
            {trends.lastUpdated && (
              <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                <Clock className="h-4 w-4" />
                {new Date(trends.lastUpdated).toLocaleTimeString('ko-KR')} 업데이트
              </div>
            )}
            <Link href="/write">
              <Button variant="primary">
                <Wand2 className="h-4 w-4 mr-2" />
                글쓰기 시작
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Trend Content */}
          <div className="lg:col-span-2">
            {/* Hot Topics */}
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  인기 급상승 주제
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {trendData.slice(0, 6).map((trend: ExtendedTrendData, i: number) => (
                  <motion.div
                    key={trend.keyword}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href="/write">
                      <Card
                        className="p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() =>
                          handleSelectTopic({
                            topic: trend.keyword,
                            title: `${trend.keyword}에 대한 블로그 글`,
                            description: trend.description || '',
                            score: trend.score,
                            reasoning: '',
                            trendData: {
                              currentVolume: trend.volume,
                              growthRate: trend.growth,
                              competitionLevel: 'medium',
                              bestPostingTime: trend.peakTime,
                            },
                            relatedKeywords: trend.relatedKeywords || [],
                            suggestedAngles: [],
                            estimatedTraffic: { daily: 0, weekly: 0, monthly: trend.volume },
                            contentGap: '',
                            targetAudience: '',
                          })
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-zinc-900 dark:text-white">
                                {trend.keyword}
                              </span>
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                              {trend.description || `${trend.keyword} 관련 트렌드`}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {(trend.volume / 1000).toFixed(0)}K
                          </Badge>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* AI Suggestions */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  AI 추천 주제
                </h2>
              </div>

              <div className="space-y-3">
                {suggestions.slice(0, 5).map((suggestion: ExtendedTopicSuggestion, i: number) => (
                  <motion.div
                    key={suggestion.topic}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href="/write">
                      <Card
                        className="p-4 hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer"
                        onClick={() => handleSelectTopic(suggestion)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-zinc-900 dark:text-white mb-1">
                              {suggestion.title}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                              {suggestion.reasoning || suggestion.description || ''}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant={
                                  suggestion.difficulty === 'easy'
                                    ? 'success'
                                    : suggestion.difficulty === 'hard'
                                    ? 'error'
                                    : 'warning'
                                }
                                size="sm"
                              >
                                {suggestion.difficulty === 'easy'
                                  ? '쉬움'
                                  : suggestion.difficulty === 'hard'
                                  ? '어려움'
                                  : '보통'}
                              </Badge>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                예상 트래픽: {(suggestion.estimatedTraffic?.monthly || 0 / 1000).toFixed(0)}K
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Category Stats */}
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  카테고리별 트렌드
                </h3>
              </div>

              <div className="space-y-3">
                {(() => {
                  const categories: Record<string, number> = {};
                  trendData.forEach((t: ExtendedTrendData) => {
                    const cat = t.category || '기타';
                    categories[cat] = (categories[cat] || 0) + 1;
                  });
                  return Object.entries(categories)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {cat}
                        </span>
                        <Badge variant="default" size="sm">
                          {count}개
                        </Badge>
                      </div>
                    ));
                })()}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
                빠른 시작
              </h3>

              <div className="space-y-3">
                <Link href="/write">
                  <Button variant="primary" fullWidth>
                    <Wand2 className="h-4 w-4 mr-2" />
                    AI 글쓰기 시작
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={fetchTrends}
                  disabled={isLoading}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  트렌드 새로고침
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
