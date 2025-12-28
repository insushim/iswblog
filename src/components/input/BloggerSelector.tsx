'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input';
import { UnderlineTabs } from '@/components/ui/tabs';
import { SimpleTooltip } from '@/components/ui/tooltip';
import {
  koreanBloggers,
  internationalBloggers,
  getBloggerStyleSummary,
} from '@/lib/bloggers';
import type { BloggerProfile } from '@/types';
import { formatNumber } from '@/lib/utils';
import {
  Users,
  Globe,
  Check,
  Info,
  Star,
  TrendingUp,
} from 'lucide-react';

// ============================================================
// Blogger Selector Component
// ============================================================

export function BloggerSelector() {
  const { input, actions } = useBlogStore();
  const [activeTab, setActiveTab] = React.useState<'korean' | 'international'>('korean');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const bloggers = activeTab === 'korean' ? koreanBloggers : internationalBloggers;

  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    bloggers.forEach((b) => cats.add(b.category));
    return Array.from(cats);
  }, [bloggers]);

  const filteredBloggers = React.useMemo(() => {
    return bloggers.filter((blogger) => {
      const matchesSearch =
        !searchQuery ||
        blogger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blogger.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || blogger.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [bloggers, searchQuery, selectedCategory]);

  const toggleBlogger = (bloggerId: string) => {
    const isSelected = input.selectedBloggerStyles.includes(bloggerId);
    if (isSelected) {
      actions.setInput(
        'selectedBloggerStyles',
        input.selectedBloggerStyles.filter((id) => id !== bloggerId)
      );
    } else if (input.selectedBloggerStyles.length < 3) {
      actions.setInput('selectedBloggerStyles', [...input.selectedBloggerStyles, bloggerId]);
    }
  };

  const isSelected = (bloggerId: string) =>
    input.selectedBloggerStyles.includes(bloggerId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-zinc-500" />
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            파워블로거 스타일
          </label>
        </div>
        <Badge variant="default" size="sm">
          {input.selectedBloggerStyles.length}/3 선택
        </Badge>
      </div>

      {/* Tabs */}
      <UnderlineTabs
        tabs={[
          { id: 'korean', label: '국내 블로거', count: koreanBloggers.length },
          { id: 'international', label: '해외 블로거', count: internationalBloggers.length },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as 'korean' | 'international')}
      />

      {/* Search */}
      <SearchInput
        placeholder="블로거 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClear={() => setSearchQuery('')}
      />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? 'primary' : 'default'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory(null)}
        >
          전체
        </Badge>
        {categories.slice(0, 6).map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'primary' : 'default'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Selected Bloggers */}
      {input.selectedBloggerStyles.length > 0 && (
        <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
            선택된 스타일
          </p>
          <div className="flex flex-wrap gap-2">
            {input.selectedBloggerStyles.map((id) => {
              const blogger = [...koreanBloggers, ...internationalBloggers].find(
                (b) => b.id === id
              );
              return blogger ? (
                <Badge
                  key={id}
                  variant="primary"
                  removable
                  onRemove={() => toggleBlogger(id)}
                >
                  {blogger.name}
                </Badge>
              ) : null;
            })}
          </div>
        </Card>
      )}

      {/* Blogger List */}
      <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
        {filteredBloggers.map((blogger) => (
          <BloggerCard
            key={blogger.id}
            blogger={blogger}
            isSelected={isSelected(blogger.id)}
            onToggle={() => toggleBlogger(blogger.id)}
            disabled={!isSelected(blogger.id) && input.selectedBloggerStyles.length >= 3}
          />
        ))}
        {filteredBloggers.length === 0 && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-8">
            검색 결과가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

// Blogger Card
interface BloggerCardProps {
  blogger: BloggerProfile;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
}

function BloggerCard({ blogger, isSelected, onToggle, disabled }: BloggerCardProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <Card
      className={cn(
        'p-3 transition-all cursor-pointer',
        isSelected
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-400'
          : disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-zinc-300 dark:hover:border-zinc-600'
      )}
      onClick={() => !disabled && onToggle()}
    >
      <div className="flex items-start gap-3">
        {/* Selection Indicator */}
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
            isSelected
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-zinc-300 dark:border-zinc-600'
          )}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {blogger.name}
            </span>
            {blogger.language && (
              <Globe className="w-3 h-3 text-zinc-400" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" size="sm">
              {blogger.category}
            </Badge>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {formatNumber(blogger.monthlyVisitors)}/월
            </span>
          </div>

          {/* Quick Info */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">
            {getBloggerStyleSummary(blogger)}
          </p>

          {/* Details Toggle */}
          <Button
            variant="ghost"
            size="xs"
            className="mt-2 -ml-2"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
          >
            <Info className="w-3 h-3 mr-1" />
            {showDetails ? '접기' : '상세 보기'}
          </Button>

          {/* Details */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 space-y-2">
              <div>
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  특징
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {blogger.characteristics.specialPatterns.slice(0, 4).map((pattern, i) => (
                    <Badge key={i} variant="default" size="sm">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  자주 사용하는 표현
                </p>
                <div className="space-y-1 mt-1">
                  {blogger.samplePhrases.slice(0, 3).map((phrase, i) => (
                    <p key={i} className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                      "{phrase}"
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default BloggerSelector;
