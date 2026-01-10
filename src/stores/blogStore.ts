import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  BlogInput,
  WorkflowStep,
  WorkflowState,
  TopicSuggestion,
  TrendData,
  ResearchResult,
  Outline,
  OutlineSection,
  ContentSection,
  GeneratedImage,
  ImagePlacement,
  SEOAnalysis,
  ReadabilityScore,
  SentimentAnalysis,
  BloggerStyleMatch,
  ContentGrade,
  CrossValidationResult,
  BlogMeta,
  SuggestedLink,
  HistoryEntry,
  ExportFormat,
  Platform,
  ToneType,
  LengthType,
  ImageStyle,
} from '@/types';

// ============================================================
// Blog Store - Complete State Management
// ============================================================

interface BlogStore {
  // === 입력 상태 ===
  input: BlogInput;

  // === 워크플로우 상태 ===
  workflow: WorkflowState;

  // === 트렌드 데이터 ===
  trends: {
    suggestions: TopicSuggestion[];
    currentTrends: TrendData[];
    isLoading: boolean;
    lastUpdated: Date | null;
  };

  // === 웹 검색 참고자료 ===
  webSearch: {
    isSearching: boolean;
    results: {
      summary: string;
      keyPoints: string[];
      statistics: string[];
      sources: Array<{ title: string; snippet: string; source?: string }>;
      relatedTopics: string[];
    } | null;
    lastSearched: Date | null;
  };

  // === 리서치 결과 ===
  research: ResearchResult | null;

  // === 아웃라인 ===
  outline: Outline | null;

  // === 콘텐츠 ===
  content: {
    sections: ContentSection[];
    introduction: string;
    conclusion: string;
    rawDraft: string;
    humanizedDraft: string;
    finalContent: string;
  };

  // === 이미지 ===
  images: {
    thumbnail: GeneratedImage | null;
    inlineImages: GeneratedImage[];
    placements: ImagePlacement[];
    isGenerating: boolean;
  };

  // === 분석 결과 ===
  analysis: {
    seo: SEOAnalysis | null;
    readability: ReadabilityScore | null;
    sentiment: SentimentAnalysis | null;
    bloggerStyleMatch: BloggerStyleMatch | null;
    contentGrade: ContentGrade | null;
    crossValidation: CrossValidationResult | null;
  };

  // === 메타 데이터 ===
  meta: BlogMeta;

  // === 히스토리 ===
  history: {
    entries: HistoryEntry[];
    currentIndex: number;
    maxEntries: number;
  };

  // === 프로젝트 ===
  project: {
    id: string | null;
    name: string;
    lastSaved: Date | null;
    isDirty: boolean;
  };

  // === 액션 ===
  actions: {
    // 입력
    setInput: <K extends keyof BlogInput>(field: K, value: BlogInput[K]) => void;
    setAdvancedOption: <K extends keyof BlogInput['advancedOptions']>(
      option: K,
      value: BlogInput['advancedOptions'][K]
    ) => void;
    setBulkInput: (input: Partial<BlogInput>) => void;

    // 트렌드
    fetchTrends: (category?: string) => Promise<void>;
    applyTrendSuggestion: (suggestion: TopicSuggestion) => void;
    setTrendLoading: (loading: boolean) => void;

    // 웹 검색
    fetchWebSearch: () => Promise<void>;
    clearWebSearch: () => void;
    applyWebSearchToReference: () => void;

    // 워크플로우
    startGeneration: () => Promise<void>;
    goToStep: (step: WorkflowStep) => void;
    completeStep: (step: WorkflowStep) => void;
    retryStep: (step: WorkflowStep) => Promise<void>;
    setGenerating: (generating: boolean) => void;
    setProgress: (progress: number, task?: string) => void;
    addError: (step: WorkflowStep, message: string) => void;
    clearErrors: () => void;

    // 리서치
    setResearch: (research: ResearchResult | null) => void;
    generateResearch: () => Promise<void>;

    // 아웃라인
    setOutline: (outline: Outline | null) => void;
    generateOutline: () => Promise<void>;
    updateOutline: (outline: Outline) => void;
    reorderSections: (fromIndex: number, toIndex: number) => void;
    addSection: (section: OutlineSection) => void;
    removeSection: (sectionId: string) => void;
    updateSection: (sectionId: string, updates: Partial<OutlineSection>) => void;

    // 콘텐츠
    setContent: (content: Partial<BlogStore['content']>) => void;
    generateDraft: () => Promise<void>;
    regenerateSection: (sectionId: string) => Promise<void>;
    updateSectionContent: (sectionId: string, content: string) => void;
    humanizeContent: () => Promise<void>;
    setFinalContent: (content: string) => void;

    // 이미지
    setImages: (images: Partial<BlogStore['images']>) => void;
    generateImages: () => Promise<void>;
    regenerateImage: (imageId: string) => Promise<void>;
    updateImagePlacement: (placement: ImagePlacement) => void;
    removeImage: (imageId: string) => void;
    setImageGenerating: (generating: boolean) => void;

    // 분석
    setAnalysis: (analysis: Partial<BlogStore['analysis']>) => void;
    runAnalysis: () => Promise<void>;
    runCrossValidation: () => Promise<void>;

    // SEO
    optimizeSEO: () => Promise<void>;
    generateMeta: () => Promise<void>;
    setMeta: (meta: Partial<BlogMeta>) => void;

    // 히스토리
    undo: () => void;
    redo: () => void;
    saveToHistory: () => void;

    // 프로젝트
    saveProject: () => Promise<void>;
    loadProject: (id: string) => Promise<void>;
    newProject: () => void;
    setProjectName: (name: string) => void;
    markDirty: () => void;

    // 내보내기
    exportAs: (format: ExportFormat) => Promise<Blob>;
    copyToClipboard: (platform: Platform) => Promise<void>;

    // 리셋
    reset: () => void;
    resetWorkflow: () => void;
  };
}

// 초기 입력 상태
const initialInput: BlogInput = {
  topic: '',
  title: '',
  referenceText: '',
  referenceFiles: [],
  tone: 'friendly' as ToneType,
  length: 'medium' as LengthType,
  targetAudience: '',
  keywords: [],
  category: '',
  platform: 'naver' as Platform,
  selectedBloggerStyles: [],
  advancedOptions: {
    includeStatistics: true,
    includeExamples: true,
    includeQuotes: false,
    seoFocus: 'balanced',
    humanizeLevel: 'moderate',
    imageStyle: 'photorealistic' as ImageStyle,
    imageCount: 3,
  },
};

// 초기 워크플로우 상태
const initialWorkflow: WorkflowState = {
  currentStep: 1,
  completedSteps: [],
  isGenerating: false,
  progress: 0,
  currentTask: '',
  errors: [],
};

// 초기 메타 상태
const initialMeta: BlogMeta = {
  suggestedTitles: [],
  metaDescription: '',
  hashtags: [],
  internalLinks: [],
  externalLinks: [],
  schema: '',
};

export const useBlogStore = create<BlogStore>()(
  devtools(
    persist(
      (set, get) => ({
        // === 초기 상태 ===
        input: initialInput,
        workflow: initialWorkflow,
        trends: {
          suggestions: [],
          currentTrends: [],
          isLoading: false,
          lastUpdated: null,
        },
        webSearch: {
          isSearching: false,
          results: null,
          lastSearched: null,
        },
        research: null,
        outline: null,
        content: {
          sections: [],
          introduction: '',
          conclusion: '',
          rawDraft: '',
          humanizedDraft: '',
          finalContent: '',
        },
        images: {
          thumbnail: null,
          inlineImages: [],
          placements: [],
          isGenerating: false,
        },
        analysis: {
          seo: null,
          readability: null,
          sentiment: null,
          bloggerStyleMatch: null,
          contentGrade: null,
          crossValidation: null,
        },
        meta: initialMeta,
        history: {
          entries: [],
          currentIndex: -1,
          maxEntries: 50,
        },
        project: {
          id: null,
          name: '새 프로젝트',
          lastSaved: null,
          isDirty: false,
        },

        // === 액션 ===
        actions: {
          // 입력 관련
          setInput: (field, value) => {
            set(
              (state) => ({
                input: { ...state.input, [field]: value },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'setInput'
            );
          },

          setAdvancedOption: (option, value) => {
            set(
              (state) => ({
                input: {
                  ...state.input,
                  advancedOptions: {
                    ...state.input.advancedOptions,
                    [option]: value,
                  },
                },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'setAdvancedOption'
            );
          },

          setBulkInput: (input) => {
            set(
              (state) => ({
                input: { ...state.input, ...input },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'setBulkInput'
            );
          },

          // 트렌드 관련
          fetchTrends: async (category) => {
            set(
              (state) => ({
                trends: { ...state.trends, isLoading: true },
              }),
              false,
              'fetchTrends/start'
            );

            try {
              const response = await fetch(
                `/api/trends${category ? `?category=${encodeURIComponent(category)}` : ''}`
              );
              const data = await response.json();

              if (data.trends) {
                set(
                  (state) => ({
                    trends: {
                      ...state.trends,
                      suggestions: data.suggestions || [],
                      currentTrends: data.trends || [],
                      isLoading: false,
                      lastUpdated: new Date(),
                    },
                  }),
                  false,
                  'fetchTrends/success'
                );
              } else {
                set(
                  (state) => ({
                    trends: { ...state.trends, isLoading: false },
                  }),
                  false,
                  'fetchTrends/no-data'
                );
              }
            } catch (error) {
              console.error('Failed to fetch trends:', error);
              set(
                (state) => ({
                  trends: { ...state.trends, isLoading: false },
                }),
                false,
                'fetchTrends/error'
              );
            }
          },

          applyTrendSuggestion: (suggestion) => {
            set(
              (state) => ({
                input: {
                  ...state.input,
                  topic: suggestion.topic,
                  title: suggestion.title,
                  keywords: suggestion.relatedKeywords.slice(0, 5),
                  targetAudience: suggestion.targetAudience,
                },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'applyTrendSuggestion'
            );
          },

          setTrendLoading: (loading) => {
            set(
              (state) => ({
                trends: { ...state.trends, isLoading: loading },
              }),
              false,
              'setTrendLoading'
            );
          },

          // 웹 검색 관련
          fetchWebSearch: async () => {
            const { input } = get();

            if (!input.topic) {
              return;
            }

            set(
              (state) => ({
                webSearch: { ...state.webSearch, isSearching: true },
              }),
              false,
              'fetchWebSearch/start'
            );

            try {
              const response = await fetch('/api/web-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  topic: input.topic,
                  keywords: input.keywords,
                  targetAudience: input.targetAudience,
                }),
              });

              const data = await response.json();

              if (data.success && data.data) {
                set(
                  (state) => ({
                    webSearch: {
                      isSearching: false,
                      results: data.data,
                      lastSearched: new Date(),
                    },
                  }),
                  false,
                  'fetchWebSearch/success'
                );
              } else {
                set(
                  (state) => ({
                    webSearch: { ...state.webSearch, isSearching: false },
                  }),
                  false,
                  'fetchWebSearch/no-data'
                );
              }
            } catch (error) {
              console.error('Failed to fetch web search:', error);
              set(
                (state) => ({
                  webSearch: { ...state.webSearch, isSearching: false },
                }),
                false,
                'fetchWebSearch/error'
              );
            }
          },

          clearWebSearch: () => {
            set(
              {
                webSearch: {
                  isSearching: false,
                  results: null,
                  lastSearched: null,
                },
              },
              false,
              'clearWebSearch'
            );
          },

          applyWebSearchToReference: () => {
            const { webSearch, input } = get();

            if (!webSearch.results) return;

            const { summary, keyPoints, statistics, sources } = webSearch.results;

            // 참고자료 텍스트 생성
            let referenceText = `## 주제 요약\n${summary}\n\n`;

            if (keyPoints.length > 0) {
              referenceText += `## 핵심 포인트\n`;
              keyPoints.forEach((point, i) => {
                referenceText += `${i + 1}. ${point}\n`;
              });
              referenceText += '\n';
            }

            if (statistics.length > 0) {
              referenceText += `## 관련 통계\n`;
              statistics.forEach((stat) => {
                referenceText += `• ${stat}\n`;
              });
              referenceText += '\n';
            }

            if (sources.length > 0) {
              referenceText += `## 참고 자료\n`;
              sources.forEach((source) => {
                referenceText += `• ${source.title}: ${source.snippet}`;
                if (source.source) referenceText += ` (${source.source})`;
                referenceText += '\n';
              });
            }

            // 기존 참고자료에 추가
            const newReferenceText = input.referenceText
              ? `${input.referenceText}\n\n---\n\n${referenceText}`
              : referenceText;

            set(
              (state) => ({
                input: { ...state.input, referenceText: newReferenceText },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'applyWebSearchToReference'
            );
          },

          // 워크플로우 관련
          startGeneration: async () => {
            const state = get();
            state.actions.setGenerating(true);
            state.actions.clearErrors();

            try {
              // Step 1: 리서치
              state.actions.setProgress(0, '리서치 진행 중...');
              await state.actions.generateResearch();
              state.actions.completeStep(1);

              // Step 2: 아웃라인
              state.actions.goToStep(2);
              state.actions.setProgress(15, '아웃라인 생성 중...');
              await state.actions.generateOutline();
              state.actions.completeStep(2);

              // Step 3: 초안
              state.actions.goToStep(3);
              state.actions.setProgress(30, '초안 작성 중...');
              await state.actions.generateDraft();
              state.actions.completeStep(3);

              // Step 4: 이미지
              state.actions.goToStep(4);
              state.actions.setProgress(50, '이미지 생성 중...');
              await state.actions.generateImages();
              state.actions.completeStep(4);

              // Step 5: SEO
              state.actions.goToStep(5);
              state.actions.setProgress(70, 'SEO 최적화 중...');
              await state.actions.optimizeSEO();
              state.actions.completeStep(5);

              // Step 6: 휴머나이즈
              state.actions.goToStep(6);
              state.actions.setProgress(85, '문체 다듬기 중...');
              await state.actions.humanizeContent();
              state.actions.completeStep(6);

              // Step 7: 최종 리뷰
              state.actions.goToStep(7);
              state.actions.setProgress(95, '최종 검토 중...');
              await state.actions.runAnalysis();
              state.actions.completeStep(7);

              state.actions.setProgress(100, '완료!');
            } catch (error) {
              console.error('Generation failed:', error);
              const currentStep = get().workflow.currentStep;
              state.actions.addError(
                currentStep,
                error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
              );
            } finally {
              state.actions.setGenerating(false);
            }
          },

          goToStep: (step) => {
            set(
              (state) => ({
                workflow: { ...state.workflow, currentStep: step },
              }),
              false,
              'goToStep'
            );
          },

          completeStep: (step) => {
            set(
              (state) => ({
                workflow: {
                  ...state.workflow,
                  completedSteps: state.workflow.completedSteps.includes(step)
                    ? state.workflow.completedSteps
                    : [...state.workflow.completedSteps, step],
                },
              }),
              false,
              'completeStep'
            );
          },

          retryStep: async (step) => {
            const state = get();
            state.actions.clearErrors();
            state.actions.goToStep(step);
            state.actions.setGenerating(true);

            try {
              switch (step) {
                case 1:
                  await state.actions.generateResearch();
                  break;
                case 2:
                  await state.actions.generateOutline();
                  break;
                case 3:
                  await state.actions.generateDraft();
                  break;
                case 4:
                  await state.actions.generateImages();
                  break;
                case 5:
                  await state.actions.optimizeSEO();
                  break;
                case 6:
                  await state.actions.humanizeContent();
                  break;
                case 7:
                  await state.actions.runAnalysis();
                  break;
              }
              state.actions.completeStep(step);
            } catch (error) {
              state.actions.addError(
                step,
                error instanceof Error ? error.message : '재시도 실패'
              );
            } finally {
              state.actions.setGenerating(false);
            }
          },

          setGenerating: (generating) => {
            set(
              (state) => ({
                workflow: { ...state.workflow, isGenerating: generating },
              }),
              false,
              'setGenerating'
            );
          },

          setProgress: (progress, task) => {
            set(
              (state) => ({
                workflow: {
                  ...state.workflow,
                  progress,
                  currentTask: task ?? state.workflow.currentTask,
                },
              }),
              false,
              'setProgress'
            );
          },

          addError: (step, message) => {
            set(
              (state) => ({
                workflow: {
                  ...state.workflow,
                  errors: [...state.workflow.errors, { step, message }],
                },
              }),
              false,
              'addError'
            );
          },

          clearErrors: () => {
            set(
              (state) => ({
                workflow: { ...state.workflow, errors: [] },
              }),
              false,
              'clearErrors'
            );
          },

          // 리서치 관련
          setResearch: (research) => {
            set({ research }, false, 'setResearch');
          },

          generateResearch: async () => {
            const { input } = get();
            try {
              const response = await fetch('/api/generate/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  topic: input.topic,
                  keywords: input.keywords,
                  category: input.category,
                  targetAudience: input.targetAudience,
                }),
              });

              const data = await response.json();
              if (data.success && data.research) {
                set({ research: data.research }, false, 'generateResearch');
              } else {
                throw new Error(data.error || '리서치 생성 실패');
              }
            } catch (error) {
              console.error('Research generation failed:', error);
              throw error;
            }
          },

          // 아웃라인 관련
          setOutline: (outline) => {
            set({ outline }, false, 'setOutline');
          },

          generateOutline: async () => {
            const { input, research } = get();
            try {
              const response = await fetch('/api/generate/outline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  topic: input.topic,
                  title: input.title,
                  research,
                  tone: input.tone,
                  length: input.length,
                  selectedBloggerStyles: input.selectedBloggerStyles,
                }),
              });

              const data = await response.json();
              if (data.success && data.outline) {
                set({ outline: data.outline }, false, 'generateOutline');
              } else {
                throw new Error(data.error || '아웃라인 생성 실패');
              }
            } catch (error) {
              console.error('Outline generation failed:', error);
              throw error;
            }
          },

          updateOutline: (outline) => {
            set(
              (state) => ({
                outline,
                project: { ...state.project, isDirty: true },
              }),
              false,
              'updateOutline'
            );
          },

          reorderSections: (fromIndex, toIndex) => {
            set(
              (state) => {
                if (!state.outline) return state;
                const sections = [...state.outline.structure.sections];
                const [removed] = sections.splice(fromIndex, 1);
                sections.splice(toIndex, 0, removed);
                return {
                  outline: {
                    ...state.outline,
                    structure: {
                      ...state.outline.structure,
                      sections: sections.map((s, i) => ({ ...s, order: i })),
                    },
                  },
                  project: { ...state.project, isDirty: true },
                };
              },
              false,
              'reorderSections'
            );
          },

          addSection: (section) => {
            set(
              (state) => {
                if (!state.outline) return state;
                return {
                  outline: {
                    ...state.outline,
                    structure: {
                      ...state.outline.structure,
                      sections: [...state.outline.structure.sections, section],
                    },
                  },
                  project: { ...state.project, isDirty: true },
                };
              },
              false,
              'addSection'
            );
          },

          removeSection: (sectionId) => {
            set(
              (state) => {
                if (!state.outline) return state;
                return {
                  outline: {
                    ...state.outline,
                    structure: {
                      ...state.outline.structure,
                      sections: state.outline.structure.sections.filter(
                        (s) => s.id !== sectionId
                      ),
                    },
                  },
                  project: { ...state.project, isDirty: true },
                };
              },
              false,
              'removeSection'
            );
          },

          updateSection: (sectionId, updates) => {
            set(
              (state) => {
                if (!state.outline) return state;
                return {
                  outline: {
                    ...state.outline,
                    structure: {
                      ...state.outline.structure,
                      sections: state.outline.structure.sections.map((s) =>
                        s.id === sectionId ? { ...s, ...updates } : s
                      ),
                    },
                  },
                  project: { ...state.project, isDirty: true },
                };
              },
              false,
              'updateSection'
            );
          },

          // 콘텐츠 관련
          setContent: (content) => {
            set(
              (state) => ({
                content: { ...state.content, ...content },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'setContent'
            );
          },

          generateDraft: async () => {
            const { input, outline, research } = get();
            try {
              const response = await fetch('/api/generate/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  topic: input.topic,
                  title: input.title,
                  outline,
                  research,
                  tone: input.tone,
                  length: input.length,
                  selectedBloggerStyles: input.selectedBloggerStyles,
                  advancedOptions: input.advancedOptions,
                }),
              });

              const data = await response.json();
              if (data.success && data.content) {
                set(
                  (state) => ({
                    content: {
                      ...state.content,
                      rawDraft: data.content,
                      sections: data.sections || [],
                      introduction: data.introduction || '',
                      conclusion: data.conclusion || '',
                    },
                  }),
                  false,
                  'generateDraft'
                );
              } else {
                throw new Error(data.error || '초안 생성 실패');
              }
            } catch (error) {
              console.error('Draft generation failed:', error);
              throw error;
            }
          },

          regenerateSection: async (sectionId) => {
            const { input, outline } = get();
            try {
              const response = await fetch('/api/generate/section', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sectionId,
                  outline,
                  tone: input.tone,
                  selectedBloggerStyles: input.selectedBloggerStyles,
                }),
              });

              const data = await response.json();
              if (data.success && data.content) {
                set(
                  (state) => ({
                    content: {
                      ...state.content,
                      sections: state.content.sections.map((s) =>
                        s.id === sectionId ? { ...s, content: data.content } : s
                      ),
                    },
                    project: { ...state.project, isDirty: true },
                  }),
                  false,
                  'regenerateSection'
                );
              }
            } catch (error) {
              console.error('Section regeneration failed:', error);
              throw error;
            }
          },

          updateSectionContent: (sectionId, content) => {
            set(
              (state) => ({
                content: {
                  ...state.content,
                  sections: state.content.sections.map((s) =>
                    s.id === sectionId ? { ...s, content } : s
                  ),
                },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'updateSectionContent'
            );
          },

          humanizeContent: async () => {
            const { content, input } = get();
            try {
              const response = await fetch('/api/generate/humanize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: content.rawDraft,
                  level: input.advancedOptions.humanizeLevel,
                  selectedBloggerStyles: input.selectedBloggerStyles,
                }),
              });

              const data = await response.json();
              if (data.success && data.content) {
                set(
                  (state) => ({
                    content: {
                      ...state.content,
                      humanizedDraft: data.content,
                      finalContent: data.content,
                    },
                  }),
                  false,
                  'humanizeContent'
                );
              } else {
                throw new Error(data.error || '휴머나이즈 실패');
              }
            } catch (error) {
              console.error('Humanize failed:', error);
              throw error;
            }
          },

          setFinalContent: (finalContent) => {
            set(
              (state) => ({
                content: { ...state.content, finalContent },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'setFinalContent'
            );
          },

          // 이미지 관련
          setImages: (images) => {
            set(
              (state) => ({
                images: { ...state.images, ...images },
              }),
              false,
              'setImages'
            );
          },

          generateImages: async () => {
            const { input, outline, content } = get();
            set(
              (state) => ({
                images: { ...state.images, isGenerating: true },
              }),
              false,
              'generateImages/start'
            );

            try {
              const response = await fetch('/api/generate/images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: input.title,
                  outline,
                  content: content.rawDraft,
                  style: input.advancedOptions.imageStyle,
                  count: input.advancedOptions.imageCount,
                }),
              });

              const data = await response.json();
              if (data.success) {
                set(
                  (state) => ({
                    images: {
                      ...state.images,
                      thumbnail: data.thumbnail || null,
                      inlineImages: data.images || [],
                      placements: data.placements || [],
                      isGenerating: false,
                    },
                  }),
                  false,
                  'generateImages/success'
                );
              } else {
                throw new Error(data.error || '이미지 생성 실패');
              }
            } catch (error) {
              console.error('Image generation failed:', error);
              set(
                (state) => ({
                  images: { ...state.images, isGenerating: false },
                }),
                false,
                'generateImages/error'
              );
              throw error;
            }
          },

          regenerateImage: async (imageId) => {
            const { input } = get();
            try {
              const response = await fetch('/api/generate/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageId,
                  style: input.advancedOptions.imageStyle,
                }),
              });

              const data = await response.json();
              if (data.success && data.image) {
                set(
                  (state) => ({
                    images: {
                      ...state.images,
                      inlineImages: state.images.inlineImages.map((img) =>
                        img.id === imageId ? data.image : img
                      ),
                    },
                  }),
                  false,
                  'regenerateImage'
                );
              }
            } catch (error) {
              console.error('Image regeneration failed:', error);
              throw error;
            }
          },

          updateImagePlacement: (placement) => {
            set(
              (state) => ({
                images: {
                  ...state.images,
                  placements: state.images.placements.map((p) =>
                    p.imageId === placement.imageId ? placement : p
                  ),
                },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'updateImagePlacement'
            );
          },

          removeImage: (imageId) => {
            set(
              (state) => ({
                images: {
                  ...state.images,
                  inlineImages: state.images.inlineImages.filter((img) => img.id !== imageId),
                  placements: state.images.placements.filter((p) => p.imageId !== imageId),
                },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'removeImage'
            );
          },

          setImageGenerating: (generating) => {
            set(
              (state) => ({
                images: { ...state.images, isGenerating: generating },
              }),
              false,
              'setImageGenerating'
            );
          },

          // 분석 관련
          setAnalysis: (analysis) => {
            set(
              (state) => ({
                analysis: { ...state.analysis, ...analysis },
              }),
              false,
              'setAnalysis'
            );
          },

          runAnalysis: async () => {
            const { content, input } = get();
            try {
              const response = await fetch('/api/analyze/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: content.finalContent || content.humanizedDraft || content.rawDraft,
                  keywords: input.keywords,
                  selectedBloggerStyles: input.selectedBloggerStyles,
                }),
              });

              const data = await response.json();
              if (data.success) {
                set(
                  (state) => ({
                    analysis: {
                      ...state.analysis,
                      seo: data.seo || null,
                      readability: data.readability || null,
                      sentiment: data.sentiment || null,
                      contentGrade: data.grade || null,
                      bloggerStyleMatch: data.styleMatch || null,
                    },
                  }),
                  false,
                  'runAnalysis'
                );
              }
            } catch (error) {
              console.error('Analysis failed:', error);
              throw error;
            }
          },

          runCrossValidation: async () => {
            const { content, input } = get();
            try {
              const response = await fetch('/api/analyze/cross-validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: content.finalContent || content.rawDraft,
                  selectedBloggerStyles: input.selectedBloggerStyles,
                }),
              });

              const data = await response.json();
              if (data.success && data.validation) {
                set(
                  (state) => ({
                    analysis: {
                      ...state.analysis,
                      crossValidation: data.validation,
                    },
                  }),
                  false,
                  'runCrossValidation'
                );
              }
            } catch (error) {
              console.error('Cross validation failed:', error);
              throw error;
            }
          },

          // SEO 관련
          optimizeSEO: async () => {
            const { content, input } = get();
            try {
              const response = await fetch('/api/generate/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: content.rawDraft,
                  title: input.title,
                  keywords: input.keywords,
                  platform: input.platform,
                }),
              });

              const data = await response.json();
              if (data.success) {
                set(
                  (state) => ({
                    analysis: {
                      ...state.analysis,
                      seo: data.seo || null,
                    },
                    meta: {
                      ...state.meta,
                      suggestedTitles: data.suggestedTitles || [],
                      metaDescription: data.metaDescription || '',
                      hashtags: data.hashtags || [],
                    },
                  }),
                  false,
                  'optimizeSEO'
                );
              }
            } catch (error) {
              console.error('SEO optimization failed:', error);
              throw error;
            }
          },

          generateMeta: async () => {
            const { content, input } = get();
            try {
              const response = await fetch('/api/generate/meta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: content.finalContent || content.rawDraft,
                  title: input.title,
                  keywords: input.keywords,
                }),
              });

              const data = await response.json();
              if (data.success) {
                set(
                  (state) => ({
                    meta: {
                      ...state.meta,
                      ...data.meta,
                    },
                  }),
                  false,
                  'generateMeta'
                );
              }
            } catch (error) {
              console.error('Meta generation failed:', error);
              throw error;
            }
          },

          setMeta: (meta) => {
            set(
              (state) => ({
                meta: { ...state.meta, ...meta },
                project: { ...state.project, isDirty: true },
              }),
              false,
              'setMeta'
            );
          },

          // 히스토리 관련
          undo: () => {
            set(
              (state) => {
                if (state.history.currentIndex <= 0) return state;
                const newIndex = state.history.currentIndex - 1;
                const entry = state.history.entries[newIndex];
                return {
                  content: {
                    ...state.content,
                    finalContent: entry.contentSnapshot,
                  },
                  history: {
                    ...state.history,
                    currentIndex: newIndex,
                  },
                };
              },
              false,
              'undo'
            );
          },

          redo: () => {
            set(
              (state) => {
                if (state.history.currentIndex >= state.history.entries.length - 1) return state;
                const newIndex = state.history.currentIndex + 1;
                const entry = state.history.entries[newIndex];
                return {
                  content: {
                    ...state.content,
                    finalContent: entry.contentSnapshot,
                  },
                  history: {
                    ...state.history,
                    currentIndex: newIndex,
                  },
                };
              },
              false,
              'redo'
            );
          },

          saveToHistory: () => {
            set(
              (state) => {
                const newEntry: HistoryEntry = {
                  id: uuidv4(),
                  timestamp: new Date(),
                  action: 'edit',
                  contentSnapshot: state.content.finalContent,
                  metadata: {},
                };

                const entries = [
                  ...state.history.entries.slice(0, state.history.currentIndex + 1),
                  newEntry,
                ].slice(-state.history.maxEntries);

                return {
                  history: {
                    ...state.history,
                    entries,
                    currentIndex: entries.length - 1,
                  },
                };
              },
              false,
              'saveToHistory'
            );
          },

          // 프로젝트 관련
          saveProject: async () => {
            const state = get();
            const projectData = {
              id: state.project.id || uuidv4(),
              name: state.project.name,
              input: state.input,
              outline: state.outline,
              content: state.content,
              images: state.images,
              meta: state.meta,
              analysis: state.analysis,
            };

            try {
              const response = await fetch('/api/projects/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData),
              });

              const data = await response.json();
              if (data.success) {
                set(
                  (state) => ({
                    project: {
                      ...state.project,
                      id: data.id,
                      lastSaved: new Date(),
                      isDirty: false,
                    },
                  }),
                  false,
                  'saveProject'
                );
              }
            } catch (error) {
              console.error('Project save failed:', error);
              throw error;
            }
          },

          loadProject: async (id) => {
            try {
              const response = await fetch(`/api/projects/${id}`);
              const data = await response.json();

              if (data.success && data.project) {
                set(
                  {
                    project: {
                      id: data.project.id,
                      name: data.project.name,
                      lastSaved: new Date(data.project.updatedAt),
                      isDirty: false,
                    },
                    input: data.project.input,
                    outline: data.project.outline,
                    content: data.project.content,
                    images: data.project.images,
                    meta: data.project.meta,
                    analysis: data.project.analysis,
                  },
                  false,
                  'loadProject'
                );
              }
            } catch (error) {
              console.error('Project load failed:', error);
              throw error;
            }
          },

          newProject: () => {
            set(
              {
                project: {
                  id: null,
                  name: '새 프로젝트',
                  lastSaved: null,
                  isDirty: false,
                },
                input: initialInput,
                workflow: initialWorkflow,
                research: null,
                outline: null,
                content: {
                  sections: [],
                  introduction: '',
                  conclusion: '',
                  rawDraft: '',
                  humanizedDraft: '',
                  finalContent: '',
                },
                images: {
                  thumbnail: null,
                  inlineImages: [],
                  placements: [],
                  isGenerating: false,
                },
                analysis: {
                  seo: null,
                  readability: null,
                  sentiment: null,
                  bloggerStyleMatch: null,
                  contentGrade: null,
                  crossValidation: null,
                },
                meta: initialMeta,
                history: {
                  entries: [],
                  currentIndex: -1,
                  maxEntries: 50,
                },
              },
              false,
              'newProject'
            );
          },

          setProjectName: (name) => {
            set(
              (state) => ({
                project: { ...state.project, name, isDirty: true },
              }),
              false,
              'setProjectName'
            );
          },

          markDirty: () => {
            set(
              (state) => ({
                project: { ...state.project, isDirty: true },
              }),
              false,
              'markDirty'
            );
          },

          // 내보내기 관련
          exportAs: async (format) => {
            const { content, images, meta, input } = get();
            try {
              const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  format,
                  content: content.finalContent,
                  images,
                  meta,
                  title: input.title,
                }),
              });

              if (!response.ok) {
                throw new Error('Export failed');
              }

              return await response.blob();
            } catch (error) {
              console.error('Export failed:', error);
              throw error;
            }
          },

          copyToClipboard: async (platform) => {
            const { content, meta, input } = get();
            try {
              const response = await fetch('/api/export/clipboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  platform,
                  content: content.finalContent,
                  meta,
                  title: input.title,
                }),
              });

              const data = await response.json();
              if (data.success && data.formattedContent) {
                await navigator.clipboard.writeText(data.formattedContent);
              }
            } catch (error) {
              console.error('Copy to clipboard failed:', error);
              throw error;
            }
          },

          // 리셋 관련
          reset: () => {
            set(
              {
                input: initialInput,
                workflow: initialWorkflow,
                trends: {
                  suggestions: [],
                  currentTrends: [],
                  isLoading: false,
                  lastUpdated: null,
                },
                webSearch: {
                  isSearching: false,
                  results: null,
                  lastSearched: null,
                },
                research: null,
                outline: null,
                content: {
                  sections: [],
                  introduction: '',
                  conclusion: '',
                  rawDraft: '',
                  humanizedDraft: '',
                  finalContent: '',
                },
                images: {
                  thumbnail: null,
                  inlineImages: [],
                  placements: [],
                  isGenerating: false,
                },
                analysis: {
                  seo: null,
                  readability: null,
                  sentiment: null,
                  bloggerStyleMatch: null,
                  contentGrade: null,
                  crossValidation: null,
                },
                meta: initialMeta,
                history: {
                  entries: [],
                  currentIndex: -1,
                  maxEntries: 50,
                },
                project: {
                  id: null,
                  name: '새 프로젝트',
                  lastSaved: null,
                  isDirty: false,
                },
              },
              false,
              'reset'
            );
          },

          resetWorkflow: () => {
            set(
              {
                workflow: initialWorkflow,
              },
              false,
              'resetWorkflow'
            );
          },
        },
      }),
      {
        name: 'blogforge-storage',
        partialize: (state) => ({
          project: state.project,
          input: state.input,
          outline: state.outline,
          content: state.content,
          meta: state.meta,
        }),
      }
    ),
    { name: 'BlogStore' }
  )
);

// 선택자 훅
export const useBlogInput = () => useBlogStore((state) => state.input);
export const useBlogWorkflow = () => useBlogStore((state) => state.workflow);
export const useBlogTrends = () => useBlogStore((state) => state.trends);
export const useBlogWebSearch = () => useBlogStore((state) => state.webSearch);
export const useBlogResearch = () => useBlogStore((state) => state.research);
export const useBlogOutline = () => useBlogStore((state) => state.outline);
export const useBlogContent = () => useBlogStore((state) => state.content);
export const useBlogImages = () => useBlogStore((state) => state.images);
export const useBlogAnalysis = () => useBlogStore((state) => state.analysis);
export const useBlogMeta = () => useBlogStore((state) => state.meta);
export const useBlogProject = () => useBlogStore((state) => state.project);
export const useBlogActions = () => useBlogStore((state) => state.actions);
