'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge, KeywordBadge } from '@/components/ui/badge';
import { SimpleTooltip } from '@/components/ui/tooltip';
import {
  Sparkles,
  Lightbulb,
  Target,
  Hash,
  Plus,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// ============================================================
// Topic Input Component
// ============================================================

export function TopicInput() {
  const { input, trends, actions } = useBlogStore();
  const [newKeyword, setNewKeyword] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !input.keywords.includes(newKeyword.trim())) {
      actions.setInput('keywords', [...input.keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    actions.setInput('keywords', input.keywords.filter((k) => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleFetchTrends = async () => {
    await actions.fetchTrends(input.category || undefined);
    setShowSuggestions(true);
  };

  return (
    <div className="space-y-6">
      {/* Topic */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            주제
          </label>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleFetchTrends}
            disabled={trends.isLoading}
          >
            {trends.isLoading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            트렌드 주제 추천
          </Button>
        </div>
        <Input
          placeholder="예: 2024년 블로그 수익화 전략"
          value={input.topic}
          onChange={(e) => actions.setInput('topic', e.target.value)}
        />

        {/* Trend Suggestions */}
        {showSuggestions && trends.suggestions.length > 0 && (
          <Card className="mt-3 p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  추천 주제
                </span>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setShowSuggestions(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {trends.suggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    actions.applyTrendSuggestion(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-left rounded-md hover:bg-white/50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {suggestion.topic}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {suggestion.reasoning}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {suggestion.trendData?.growthRate !== undefined && (
                      <Badge variant="success" size="sm">
                        +{suggestion.trendData.growthRate}%
                      </Badge>
                    )}
                    {suggestion.trendData?.competitionLevel && (
                      <Badge
                        variant={
                          suggestion.trendData.competitionLevel === 'low'
                            ? 'success'
                            : suggestion.trendData.competitionLevel === 'medium'
                            ? 'warning'
                            : 'error'
                        }
                        size="sm"
                      >
                        경쟁 {suggestion.trendData.competitionLevel === 'low' ? '낮음' :
                              suggestion.trendData.competitionLevel === 'medium' ? '보통' : '높음'}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            제목
          </label>
          <SimpleTooltip content="SEO에 최적화된 제목을 작성하세요. AI가 추가 제안을 제공합니다.">
            <span className="text-zinc-400 cursor-help">?</span>
          </SimpleTooltip>
        </div>
        <Input
          placeholder="예: 블로그로 월 100만원 버는 현실적인 방법 7가지"
          value={input.title}
          onChange={(e) => actions.setInput('title', e.target.value)}
        />
      </div>

      {/* Target Audience */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-zinc-500" />
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            타겟 독자
          </label>
        </div>
        <Input
          placeholder="예: 블로그를 시작하려는 20-30대 직장인"
          value={input.targetAudience}
          onChange={(e) => actions.setInput('targetAudience', e.target.value)}
        />
      </div>

      {/* Keywords */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Hash className="h-4 w-4 text-zinc-500" />
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            키워드
          </label>
          <span className="text-xs text-zinc-500">
            ({input.keywords.length}/10)
          </span>
        </div>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="키워드 입력 후 Enter"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={input.keywords.length >= 10}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim() || input.keywords.length >= 10}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {input.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {input.keywords.map((keyword) => (
              <KeywordBadge
                key={keyword}
                keyword={keyword}
                onRemove={() => handleRemoveKeyword(keyword)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reference Text */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            참고 자료 (선택)
          </label>
        </div>
        <Textarea
          placeholder="참고할 자료나 메모를 입력하세요. AI가 이를 바탕으로 더 정확한 콘텐츠를 생성합니다."
          value={input.referenceText}
          onChange={(e) => actions.setInput('referenceText', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}

export default TopicInput;
