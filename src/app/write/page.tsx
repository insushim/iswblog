'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlogStore } from '@/stores/blogStore';
import { MainLayout } from '@/components/layout';
import { TiptapEditor, ContentPreview, ImageGallery } from '@/components/editor';
import { SEOAnalyzer, ContentGrader } from '@/components/analysis';
import { ExportPanel } from '@/components/workflow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge, KeywordBadge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { SimpleTooltip } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Target,
  Hash,
  Plus,
  X,
  Loader2,
  RefreshCw,
  Globe,
  CheckCircle,
  BookOpen,
  BarChart3,
  FileText,
  Search,
  Settings,
  List,
  PenTool,
  Eye,
  Share2,
  Check,
  AlertCircle,
} from 'lucide-react';

// ============================================================
// Step-based Full Screen Write Page
// ============================================================

type WriteStep = 'settings' | 'outline' | 'draft' | 'edit' | 'export';

const STEPS: { id: WriteStep; label: string; icon: React.ReactNode }[] = [
  { id: 'settings', label: '글쓰기 설정', icon: <Settings className="h-5 w-5" /> },
  { id: 'outline', label: '아웃라인', icon: <List className="h-5 w-5" /> },
  { id: 'draft', label: '초안 작성', icon: <PenTool className="h-5 w-5" /> },
  { id: 'edit', label: '편집', icon: <Eye className="h-5 w-5" /> },
  { id: 'export', label: '내보내기', icon: <Share2 className="h-5 w-5" /> },
];

export default function WritePage() {
  const [currentStep, setCurrentStep] = React.useState<WriteStep>('settings');
  const { input, content, outline, workflow, trends, webSearch, actions } = useBlogStore();

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const canGoNext = currentStepIndex < STEPS.length - 1;
  const canGoPrev = currentStepIndex > 0;

  const goToStep = (step: WriteStep) => setCurrentStep(step);
  const goNext = () => canGoNext && setCurrentStep(STEPS[currentStepIndex + 1].id);
  const goPrev = () => canGoPrev && setCurrentStep(STEPS[currentStepIndex - 1].id);

  // Check if step can proceed
  const canProceedFromSettings = input.topic.trim().length > 0;
  const canProceedFromOutline = outline !== null;
  const canProceedFromDraft = content.rawDraft || content.finalContent;

  return (
    <MainLayout showSidebar={false}>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Step Progress Bar */}
        <div className="flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      currentStep === step.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : index < currentStepIndex
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : index < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                    }`}>
                      {index < currentStepIndex ? <Check className="h-4 w-4" /> : step.icon}
                    </div>
                    <span className="hidden md:block font-medium">{step.label}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      index < currentStepIndex
                        ? 'bg-green-500'
                        : 'bg-zinc-200 dark:bg-zinc-700'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-auto"
            >
              {currentStep === 'settings' && (
                <SettingsStep onNext={goNext} />
              )}
              {currentStep === 'outline' && (
                <OutlineStep onNext={goNext} onPrev={goPrev} />
              )}
              {currentStep === 'draft' && (
                <DraftStep onNext={goNext} onPrev={goPrev} />
              )}
              {currentStep === 'edit' && (
                <EditStep onNext={goNext} onPrev={goPrev} />
              )}
              {currentStep === 'export' && (
                <ExportStep onPrev={goPrev} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}

// ============================================================
// Step 1: Settings
// ============================================================

function SettingsStep({ onNext }: { onNext: () => void }) {
  const { input, trends, webSearch, actions } = useBlogStore();
  const [newKeyword, setNewKeyword] = React.useState('');
  const [showTrends, setShowTrends] = React.useState(false);
  const [showWebSearch, setShowWebSearch] = React.useState(false);

  const handleFetchTrends = async () => {
    await actions.fetchTrends(input.category || undefined);
    setShowTrends(true);
  };

  const handleRefreshTrends = async () => {
    await actions.fetchTrends(input.category || undefined);
  };

  const handleWebSearch = async () => {
    await actions.fetchWebSearch();
    setShowWebSearch(true);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !input.keywords.includes(newKeyword.trim())) {
      actions.setInput('keywords', [...input.keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const canProceed = input.topic.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          글쓰기 설정
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          주제와 스타일을 설정하고 AI 글쓰기를 시작하세요
        </p>
      </div>

      <div className="space-y-8">
        {/* Topic Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              주제 선택
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchTrends}
              disabled={trends.isLoading}
            >
              {trends.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              트렌드 주제 추천
            </Button>
          </div>

          <Input
            placeholder="예: 2025년 블로그 수익화 전략"
            value={input.topic}
            onChange={(e) => actions.setInput('topic', e.target.value)}
            className="text-lg py-6"
          />

          {/* Trend Suggestions */}
          {showTrends && trends.suggestions.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    실시간 추천 주제
                  </span>
                  <Badge variant="outline" size="sm">LIVE</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleRefreshTrends}
                    disabled={trends.isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${trends.isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowTrends(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                {trends.suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      actions.applyTrendSuggestion(suggestion);
                      setShowTrends(false);
                    }}
                    className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {suggestion.title || suggestion.topic}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {suggestion.reasoning}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {suggestion.trendData?.growthRate !== undefined && (
                        <Badge variant="success" size="sm">
                          +{suggestion.trendData.growthRate}%
                        </Badge>
                      )}
                      {suggestion.trendData?.competitionLevel && (
                        <Badge
                          variant={
                            suggestion.trendData.competitionLevel === 'low' ? 'success' :
                            suggestion.trendData.competitionLevel === 'medium' ? 'warning' : 'error'
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
            </div>
          )}
        </Card>

        {/* Title Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            제목
          </h2>
          <Input
            placeholder="예: 블로그로 월 100만원 버는 현실적인 방법 7가지"
            value={input.title}
            onChange={(e) => actions.setInput('title', e.target.value)}
          />
        </Card>

        {/* Target Audience & Keywords */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                타겟 독자
              </h2>
            </div>
            <Input
              placeholder="예: 블로그를 시작하려는 20-30대 직장인"
              value={input.targetAudience}
              onChange={(e) => actions.setInput('targetAudience', e.target.value)}
            />
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                키워드
              </h2>
              <span className="text-sm text-zinc-500">({input.keywords.length}/10)</span>
            </div>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="키워드 입력 후 Enter"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
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
                    onRemove={() => actions.setInput('keywords', input.keywords.filter(k => k !== keyword))}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Reference Material */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              참고 자료 (선택)
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWebSearch}
              disabled={!input.topic || webSearch.isSearching}
            >
              {webSearch.isSearching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
              웹에서 자료 검색
            </Button>
          </div>

          {/* Web Search Results */}
          {showWebSearch && webSearch.results && (
            <div className="mb-4 p-4 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    검색된 참고자료
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      actions.applyWebSearchToReference();
                      setShowWebSearch(false);
                    }}
                    className="text-emerald-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    적용
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowWebSearch(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                {webSearch.results.summary}
              </p>

              {webSearch.results.keyPoints.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1 mb-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">핵심 포인트</span>
                  </div>
                  <ul className="space-y-1">
                    {webSearch.results.keyPoints.slice(0, 4).map((point, i) => (
                      <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {webSearch.results.statistics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {webSearch.results.statistics.slice(0, 3).map((stat, i) => (
                    <Badge key={i} variant="outline" size="sm">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {stat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {webSearch.isSearching && (
            <div className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <span className="text-zinc-600 dark:text-zinc-400">웹에서 참고자료를 검색하는 중...</span>
            </div>
          )}

          <Textarea
            placeholder="참고할 자료나 메모를 입력하세요. AI가 이를 바탕으로 더 정확한 콘텐츠를 생성합니다."
            value={input.referenceText}
            onChange={(e) => actions.setInput('referenceText', e.target.value)}
            rows={6}
          />
        </Card>

        {/* Next Button */}
        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            onClick={onNext}
            disabled={!canProceed}
            className="px-8"
          >
            다음: 아웃라인 생성
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Step 2: Outline
// ============================================================

function OutlineStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { input, outline, workflow, actions } = useBlogStore();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerateOutline = async () => {
    setIsGenerating(true);
    setError(null);

    console.log('[OutlineStep] Generating outline for:', input.topic);

    try {
      const response = await fetch('/api/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: input.topic,
          title: input.title,
          tone: input.tone,
          length: input.length,
          keywords: input.keywords,
          platform: input.platform,
          referenceText: input.referenceText,
        }),
      });

      const data = await response.json();
      console.log('[OutlineStep] API response:', data);

      if (data.error) {
        setError(data.error);
        console.error('[OutlineStep] API error:', data.error);
      } else if (data.structure?.sections || data.sections) {
        actions.setOutline(data);
        console.log('[OutlineStep] Outline saved to store');
      } else {
        setError('아웃라인 형식이 올바르지 않습니다.');
        console.error('[OutlineStep] Invalid response format:', data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(`아웃라인 생성 실패: ${errorMessage}`);
      console.error('[OutlineStep] Fetch error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          아웃라인 생성
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          AI가 글의 구조를 설계합니다. 필요하면 수정하세요.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">오류 발생</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              <p className="text-xs text-red-500 dark:text-red-500 mt-2">
                브라우저 콘솔(F12)에서 상세 로그를 확인하세요.
              </p>
            </div>
          </div>
        </Card>
      )}

      {!outline ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            {isGenerating ? (
              <>
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  아웃라인 생성 중...
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  AI가 최적의 글 구조를 설계하고 있습니다
                </p>
              </>
            ) : (
              <>
                <List className="h-16 w-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  아웃라인을 생성해주세요
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                  주제: <span className="font-medium">{input.topic || '미설정'}</span>
                </p>
                <Button
                  size="lg"
                  onClick={handleGenerateOutline}
                  disabled={!input.topic}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  AI 아웃라인 생성
                </Button>
              </>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {outline.title || input.topic}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateOutline}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              다시 생성
            </Button>
          </div>

          <div className="space-y-4">
            {(outline.structure?.sections || []).map((section, index) => (
              <div
                key={section.id || index}
                className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                  <h4 className="font-medium text-zinc-800 dark:text-zinc-200">
                    {section.heading}
                  </h4>
                </div>
                {section.keyPoints.length > 0 && (
                  <ul className="ml-11 space-y-1">
                    {section.keyPoints.map((point, i) => (
                      <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                        • {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-8">
        <Button variant="outline" size="lg" onClick={onPrev}>
          <ChevronLeft className="h-5 w-5 mr-2" />
          이전
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!outline}
          className="px-8"
        >
          다음: 초안 작성
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Step 3: Draft
// ============================================================

function DraftStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { input, outline, content, actions } = useBlogStore();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    setProgress(10);

    try {
      const state = useBlogStore.getState();
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.input.topic,
          title: state.input.title,
          outline: state.outline,
          tone: state.input.tone,
          length: state.input.length,
          platform: state.input.platform,
          referenceText: state.input.referenceText,
          advancedOptions: state.input.advancedOptions,
        }),
      });

      setProgress(70);
      const data = await response.json();

      if (!data.error && data.content) {
        actions.setContent({
          rawDraft: data.content,
          finalContent: data.content,
        });
        setProgress(100);
      }
    } catch (error) {
      console.error('Draft generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasDraft = content.rawDraft || content.finalContent;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          초안 작성
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          AI가 아웃라인을 바탕으로 초안을 작성합니다
        </p>
      </div>

      {!hasDraft ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            {isGenerating ? (
              <>
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  초안 작성 중...
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                  AI가 열심히 글을 쓰고 있습니다
                </p>
                <Progress value={progress} className="w-full" />
              </>
            ) : (
              <>
                <PenTool className="h-16 w-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  초안을 생성해주세요
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                  아웃라인을 기반으로 AI가 초안을 작성합니다
                </p>
                <Button size="lg" onClick={handleGenerateDraft}>
                  <Sparkles className="h-5 w-5 mr-2" />
                  초안 생성
                </Button>
              </>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              생성된 초안
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                초안 완료
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateDraft}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                다시 생성
              </Button>
            </div>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none max-h-[500px] overflow-auto p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: (content.finalContent || content.rawDraft).replace(/\n/g, '<br>') }} />
          </div>

          <p className="text-sm text-zinc-500 mt-4">
            {(content.finalContent || content.rawDraft).length.toLocaleString()}자
          </p>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-8">
        <Button variant="outline" size="lg" onClick={onPrev}>
          <ChevronLeft className="h-5 w-5 mr-2" />
          이전
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!hasDraft}
          className="px-8"
        >
          다음: 편집하기
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Step 4: Edit
// ============================================================

function EditStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { content, actions } = useBlogStore();
  const [viewMode, setViewMode] = React.useState<'edit' | 'preview'>('edit');
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const editorContainerRef = React.useRef<HTMLDivElement>(null);

  const handleContentChange = (newContent: string) => {
    actions.setFinalContent(newContent);
  };

  const handleSEOOptimize = async () => {
    setIsOptimizing(true);
    try {
      const state = useBlogStore.getState();
      const response = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: state.content.finalContent || state.content.rawDraft,
          title: state.input.title,
          keywords: state.input.keywords,
          platform: state.input.platform,
        }),
      });

      const data = await response.json();
      if (data.optimizedContent) {
        actions.setContent({ finalContent: data.optimizedContent });
      }
    } catch (error) {
      console.error('SEO optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleHumanize = async () => {
    setIsOptimizing(true);
    try {
      const state = useBlogStore.getState();
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: state.content.finalContent || state.content.rawDraft,
          level: state.input.advancedOptions.humanizeLevel,
          tone: state.input.tone,
        }),
      });

      const data = await response.json();
      if (data.humanizedContent) {
        actions.setContent({
          humanizedDraft: data.humanizedContent,
          finalContent: data.humanizedContent,
        });
      }
    } catch (error) {
      console.error('Humanize error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
            >
              <PenTool className="h-4 w-4 mr-2" />
              편집
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="h-4 w-4 mr-2" />
              미리보기
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSEOOptimize}
              disabled={isOptimizing}
            >
              {isOptimizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              SEO 최적화
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleHumanize}
              disabled={isOptimizing}
            >
              {isOptimizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              휴머나이즈
            </Button>
          </div>
        </div>
      </div>

      {/* Editor / Preview */}
      <div
        ref={editorContainerRef}
        className="flex-1 overflow-auto"
        style={{ minHeight: 0 }}
      >
        {viewMode === 'edit' ? (
          <div className="h-full min-h-[500px]">
            <TiptapEditor
              content={content.finalContent || content.rawDraft || ''}
              onChange={handleContentChange}
              showToolbar
              showBubbleMenu
              className="h-full"
            />
          </div>
        ) : (
          <div className="h-full overflow-auto p-6">
            <ContentPreview />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex justify-between">
          <Button variant="outline" size="lg" onClick={onPrev}>
            <ChevronLeft className="h-5 w-5 mr-2" />
            이전
          </Button>
          <Button size="lg" onClick={onNext} className="px-8">
            다음: 내보내기
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Step 5: Export
// ============================================================

function ExportStep({ onPrev }: { onPrev: () => void }) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          내보내기
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          완성된 글을 다양한 형식으로 내보내세요
        </p>
      </div>

      <ExportPanel />

      {/* Navigation */}
      <div className="flex justify-start pt-8">
        <Button variant="outline" size="lg" onClick={onPrev}>
          <ChevronLeft className="h-5 w-5 mr-2" />
          이전
        </Button>
      </div>
    </div>
  );
}
