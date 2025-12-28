'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { SimpleSelect } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PillTabs } from '@/components/ui/tabs';
import {
  Palette,
  Type,
  FileText,
  Layout,
  Image,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ToneType, LengthType, Platform, ImageStyle } from '@/types';
import { CATEGORIES } from '@/types';

// ============================================================
// Style Settings Component
// ============================================================

const toneOptions: { value: ToneType; label: string; description: string }[] = [
  { value: 'professional', label: '전문적', description: '신뢰감 있는 전문가 톤' },
  { value: 'casual', label: '캐주얼', description: '편안하고 친근한 톤' },
  { value: 'friendly', label: '친근한', description: '따뜻하고 다정한 톤' },
  { value: 'formal', label: '격식체', description: '정중하고 공식적인 톤' },
  { value: 'humorous', label: '유머러스', description: '위트있고 재미있는 톤' },
  { value: 'inspirational', label: '영감', description: '동기부여하는 톤' },
  { value: 'educational', label: '교육적', description: '가르치는 듯한 톤' },
  { value: 'storytelling', label: '스토리텔링', description: '이야기를 들려주는 톤' },
];

const lengthOptions: { value: LengthType; label: string; wordCount: string }[] = [
  { value: 'short', label: '짧은 글', wordCount: '800-1,500자' },
  { value: 'medium', label: '중간 길이', wordCount: '1,500-3,000자' },
  { value: 'long', label: '긴 글', wordCount: '3,000-5,000자' },
  { value: 'detailed', label: '상세 글', wordCount: '5,000자 이상' },
];

const platformOptions: { value: Platform; label: string }[] = [
  { value: 'naver', label: '네이버 블로그' },
  { value: 'tistory', label: '티스토리' },
  { value: 'wordpress', label: '워드프레스' },
  { value: 'medium', label: 'Medium' },
  { value: 'brunch', label: '브런치' },
  { value: 'general', label: '일반' },
];

const imageStyleOptions: { value: ImageStyle; label: string }[] = [
  { value: 'photorealistic', label: '사진 스타일' },
  { value: 'illustration', label: '일러스트' },
  { value: 'minimal-graphic', label: '미니멀' },
  { value: 'infographic', label: '인포그래픽' },
  { value: 'watercolor', label: '수채화' },
  { value: 'sketch', label: '스케치' },
  { value: '3d-render', label: '3D 렌더' },
  { value: 'flat-design', label: '플랫 디자인' },
  { value: 'isometric', label: '아이소메트릭' },
];

export function StyleSettings() {
  const { input, actions } = useBlogStore();
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Tone */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-zinc-500" />
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            톤 & 스타일
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {toneOptions.map((tone) => (
            <button
              key={tone.value}
              onClick={() => actions.setInput('tone', tone.value)}
              className={cn(
                'px-3 py-2 text-left rounded-lg border transition-colors',
                input.tone === tone.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                  : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
              )}
            >
              <p className={cn(
                'text-sm font-medium',
                input.tone === tone.value
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-zinc-700 dark:text-zinc-300'
              )}>
                {tone.label}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {tone.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Length */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-zinc-500" />
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            글 길이
          </label>
        </div>
        <PillTabs
          tabs={lengthOptions.map((l) => ({ id: l.value, label: l.label }))}
          activeTab={input.length}
          onTabChange={(id) => actions.setInput('length', id as LengthType)}
        />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          예상 글자 수: {lengthOptions.find((l) => l.value === input.length)?.wordCount}
        </p>
      </div>

      {/* Category */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layout className="h-4 w-4 text-zinc-500" />
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            카테고리
          </label>
        </div>
        <SimpleSelect
          placeholder="카테고리 선택"
          value={input.category}
          onValueChange={(value) => actions.setInput('category', value)}
          options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
        />
      </div>

      {/* Platform */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type className="h-4 w-4 text-zinc-500" />
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            발행 플랫폼
          </label>
        </div>
        <SimpleSelect
          placeholder="플랫폼 선택"
          value={input.platform}
          onValueChange={(value) => actions.setInput('platform', value as Platform)}
          options={platformOptions}
        />
      </div>

      {/* Advanced Settings Toggle */}
      <Button
        variant="ghost"
        fullWidth
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="justify-between"
      >
        <span className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          고급 설정
        </span>
        {showAdvanced ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* Advanced Settings */}
      {showAdvanced && (
        <Card className="p-4 space-y-6">
          {/* Content Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              콘텐츠 옵션
            </h4>
            <Switch
              label="통계/데이터 포함"
              description="관련 통계와 수치를 자동으로 포함합니다"
              checked={input.advancedOptions.includeStatistics}
              onCheckedChange={(checked) =>
                actions.setAdvancedOption('includeStatistics', checked)
              }
            />
            <Switch
              label="예시/사례 포함"
              description="이해를 돕는 예시와 사례를 포함합니다"
              checked={input.advancedOptions.includeExamples}
              onCheckedChange={(checked) =>
                actions.setAdvancedOption('includeExamples', checked)
              }
            />
            <Switch
              label="인용구 포함"
              description="전문가 인용구를 포함합니다"
              checked={input.advancedOptions.includeQuotes}
              onCheckedChange={(checked) =>
                actions.setAdvancedOption('includeQuotes', checked)
              }
            />
          </div>

          {/* SEO Focus */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-3">
              SEO 최적화 수준
            </label>
            <PillTabs
              tabs={[
                { id: 'light', label: '가볍게' },
                { id: 'balanced', label: '균형' },
                { id: 'heavy', label: '강하게' },
              ]}
              activeTab={input.advancedOptions.seoFocus}
              onTabChange={(id) =>
                actions.setAdvancedOption('seoFocus', id as 'light' | 'balanced' | 'heavy')
              }
              size="sm"
            />
          </div>

          {/* Humanize Level */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-3">
              휴머나이즈 수준
            </label>
            <PillTabs
              tabs={[
                { id: 'light', label: '가볍게' },
                { id: 'moderate', label: '보통' },
                { id: 'strong', label: '강하게' },
              ]}
              activeTab={input.advancedOptions.humanizeLevel}
              onTabChange={(id) =>
                actions.setAdvancedOption('humanizeLevel', id as 'light' | 'moderate' | 'strong')
              }
              size="sm"
            />
          </div>

          {/* Image Style */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image className="h-4 w-4 text-zinc-500" />
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                이미지 스타일
              </label>
            </div>
            <SimpleSelect
              placeholder="이미지 스타일 선택"
              value={input.advancedOptions.imageStyle}
              onValueChange={(value) =>
                actions.setAdvancedOption('imageStyle', value as ImageStyle)
              }
              options={imageStyleOptions}
            />
          </div>

          {/* Image Count */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-3">
              이미지 개수: {input.advancedOptions.imageCount}개
            </label>
            <Slider
              value={[input.advancedOptions.imageCount]}
              onValueChange={([value]) =>
                actions.setAdvancedOption('imageCount', value)
              }
              min={0}
              max={10}
              step={1}
            />
          </div>
        </Card>
      )}
    </div>
  );
}

export default StyleSettings;
