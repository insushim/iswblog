// ============================================================
// BlogForge Pro - Complete Type Definitions
// ============================================================

// === 기본 타입 ===
export type ToneType =
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'formal'
  | 'humorous'
  | 'inspirational'
  | 'educational'
  | 'storytelling';

export type LengthType = 'short' | 'medium' | 'long' | 'detailed';

export type Platform = 'naver' | 'tistory' | 'wordpress' | 'medium' | 'brunch' | 'general';

export type ImageStyle =
  | 'photorealistic'
  | 'illustration'
  | 'minimal-graphic'
  | 'infographic'
  | 'watercolor'
  | 'sketch'
  | '3d-render'
  | 'flat-design'
  | 'isometric';

export type HookType =
  | 'question'
  | 'statistic'
  | 'story'
  | 'quote'
  | 'bold-statement'
  | 'problem'
  | 'controversy'
  | 'curiosity-gap';

export type SearchIntent = 'informational' | 'transactional' | 'navigational' | 'commercial';

// === 블로거 프로필 타입 ===
export interface BloggerCharacteristics {
  sentenceLength: { average: number; variance: 'low' | 'medium' | 'high' };
  paragraphLength: { average: number; max: number };
  toneProfile: { formal: number; casual: number };
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'heavy';
  imageRatio: number;
  hookStyle: HookType;
  ctaStyle: 'soft-recommendation' | 'direct-action' | 'resource-link' | 'engagement-question';
  specialPatterns: string[];
}

export interface WritingPatterns {
  introduction: {
    length: 'short' | 'medium' | 'long';
    style: string;
    elements: string[];
  };
  body: {
    structure: string;
    subheadingStyle: string;
    transitionStyle: string;
  };
  conclusion: {
    style: string;
    ctaType: string;
  };
}

export interface BloggerProfile {
  id: string;
  name: string;
  platform: string;
  category: string;
  monthlyVisitors: number;
  language?: string;
  characteristics: BloggerCharacteristics;
  writingPatterns: WritingPatterns;
  samplePhrases: string[];
  avoidPatterns: string[];
}

// === 트렌드 타입 ===
export interface TrendData {
  source: 'google' | 'naver' | 'twitter' | 'youtube' | 'news';
  keyword: string;
  score: number;
  growth: number;
  volume: number;
  relatedKeywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  peakTime: string;
  demographicInterest: {
    ageGroups: Record<string, number>;
    regions: Record<string, number>;
  };
}

export interface TopicSuggestion {
  topic: string;
  title: string;
  score: number;
  reasoning: string;
  trendData: {
    currentVolume: number;
    growthRate: number;
    competitionLevel: 'low' | 'medium' | 'high';
    bestPostingTime: string;
  };
  relatedKeywords: string[];
  suggestedAngles: string[];
  estimatedTraffic: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  contentGap: string;
  targetAudience: string;
}

export interface TrendAnalysis {
  topTrending: TrendData[];
  risingTopics: TrendData[];
  seasonalOpportunities: {
    topic: string;
    timing: string;
    historicalPerformance: number;
  }[];
  categoryTrends: Record<string, TrendData[]>;
  predictedTopics: {
    topic: string;
    confidence: number;
    expectedPeakDate: string;
  }[];
  competitorGaps: {
    topic: string;
    opportunity: number;
    difficulty: number;
  }[];
}

// === 리서치 타입 ===
export interface ResearchResult {
  topicAnalysis: {
    mainTopic: string;
    subTopics: string[];
    searchIntent: SearchIntent;
    competitorAnalysis: {
      topRankingContent: {
        url: string;
        title: string;
        wordCount: number;
        keyPoints: string[];
        gaps: string[];
      }[];
      averageWordCount: number;
      commonStructure: string[];
      missingAngles: string[];
    };
  };
  keywordResearch: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    longTailKeywords: string[];
    questionKeywords: string[];
    searchVolume: Record<string, number>;
    difficulty: Record<string, number>;
  };
  audienceInsights: {
    demographics: string[];
    painPoints: string[];
    desiredOutcomes: string[];
    commonQuestions: string[];
  };
  contentAngle: {
    uniqueValue: string;
    differentiator: string;
    hook: string;
  };
}

// === 아웃라인 타입 ===
export interface OutlineSection {
  id: string;
  order: number;
  type: 'main' | 'sub' | 'aside';
  heading: string;
  headingLevel: 2 | 3 | 4;
  keyPoints: string[];
  supportingElements: ('example' | 'statistic' | 'quote' | 'image' | 'table' | 'list')[];
  transitionTo: string;
  estimatedWords: number;
  keywordsToInclude: string[];
  content?: string;
}

export interface Outline {
  title: string;
  meta: {
    targetWordCount: number;
    estimatedReadTime: number;
    primaryKeyword: string;
    secondaryKeywords: string[];
  };
  structure: {
    introduction: {
      hook: HookType;
      hookContent: string;
      context: string;
      thesis: string;
      preview: string[];
      estimatedWords: number;
    };
    sections: OutlineSection[];
    conclusion: {
      summaryPoints: string[];
      finalThought: string;
      cta: {
        type: 'question' | 'action' | 'resource' | 'social';
        content: string;
      };
      estimatedWords: number;
    };
  };
  imagesPlan: {
    thumbnail: {
      concept: string;
      style: string;
    };
    inlineImages: {
      afterSection: string;
      concept: string;
      purpose: string;
    }[];
  };
}

// === 이미지 타입 ===
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: ImageStyle;
  width: number;
  height: number;
  altText: string;
  caption?: string;
  createdAt: Date;
}

export interface ImagePlacement {
  imageId: string;
  sectionId: string;
  position: 'before' | 'after' | 'inline';
  alignment: 'left' | 'center' | 'right' | 'full-width';
}

export interface ImageGeneration {
  thumbnail: {
    prompt: string;
    style: ImageStyle;
    aspectRatio: '16:9' | '4:3' | '1:1';
    variations: number;
  };
  inlineImages: {
    placement: {
      afterParagraph: number;
      sectionId: string;
      alignment: 'left' | 'center' | 'right' | 'full-width';
    };
    prompt: string;
    style: ImageStyle;
    altText: string;
    caption?: string;
  }[];
  optimizationRules: {
    maxImagesPerSection: number;
    minTextBetweenImages: number;
    responsiveSizes: string[];
    lazyLoading: boolean;
    webpConversion: boolean;
  };
}

// === SEO 타입 ===
export interface SEOAnalysis {
  onPage: {
    title: {
      current: string;
      suggestions: string[];
      score: number;
      issues: string[];
    };
    metaDescription: {
      current: string;
      suggestions: string[];
      score: number;
      characterCount: number;
    };
    headings: {
      structure: string[];
      issues: string[];
      suggestions: string[];
    };
    keywords: {
      primary: { keyword: string; density: number; target: number };
      secondary: { keyword: string; density: number; target: number }[];
      lsi: string[];
    };
    internalLinks: {
      suggested: { anchor: string; url: string; context: string }[];
      count: number;
    };
    externalLinks: {
      suggested: { anchor: string; url: string; authority: number }[];
      count: number;
    };
    readability: {
      fleschScore: number;
      gradeLevel: string;
      sentenceLength: { average: number; recommendation: string };
      paragraphLength: { average: number; recommendation: string };
    };
  };
  technical: {
    wordCount: number;
    imageAltTexts: { complete: number; missing: number };
    schemaMarkup: string;
    canonicalUrl: string;
  };
  overallScore: number;
  prioritizedActions: {
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'easy' | 'medium' | 'hard';
  }[];
}

// === 콘텐츠 분석 타입 ===
export interface ReadabilityScore {
  fleschKincaid: number;
  gradeLevel: string;
  sentenceComplexity: number;
  vocabularyLevel: string;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  score: number;
  sections: {
    sectionId: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
  }[];
}

export interface BloggerStyleMatch {
  bloggerName: string;
  matchScore: number;
  matchedPatterns: string[];
  deviations: string[];
  suggestions: string[];
}

export interface ContentGrade {
  overall: number;
  breakdown: {
    quality: number;
    seo: number;
    readability: number;
    engagement: number;
    originality: number;
  };
  comparisons: {
    vsBloggerAverage: number;
    vsTopPerformers: number;
    vsCategory: number;
  };
  predictions: {
    estimatedViews: { min: number; max: number };
    estimatedEngagement: number;
    viralPotential: number;
    searchRankPotential: number;
  };
  actionableInsights: {
    category: string;
    issue: string;
    solution: string;
    impact: number;
    effort: number;
  }[];
}

export interface CrossValidationResult {
  factualAccuracy: {
    claude: { score: number; issues: string[] };
    gpt4: { score: number; issues: string[] };
    consensus: { score: number; flaggedClaims: string[] };
  };
  qualityAssessment: {
    claude: { strengths: string[]; weaknesses: string[] };
    gpt4: { strengths: string[]; weaknesses: string[] };
    combined: { improvements: string[] };
  };
  bloggerStyleComparison: {
    selectedBloggers: string[];
    styleMatchScores: Record<string, number>;
    adoptedPatterns: string[];
    deviations: string[];
    recommendations: string[];
  };
}

// === 휴머나이즈 타입 ===
export interface HumanizeResult {
  originalContent: string;
  humanizedContent: string;
  techniques: {
    sentenceVariation: boolean;
    personalTouchInjection: boolean;
    conversationalElements: boolean;
    imperfectionAddition: boolean;
    emotionalResonance: boolean;
    culturalReferences: boolean;
  };
  checks: {
    aiDetectionScore: number;
    naturalLanguageScore: number;
    engagementPrediction: number;
  };
  adjustments: {
    original: string;
    modified: string;
    reason: string;
    location: { sectionId: string; paragraphIndex: number };
  }[];
}

// === 내보내기 타입 ===
export interface ExportFormat {
  type: 'markdown' | 'html' | 'docx' | 'pdf' | 'platform-specific';
  platform?: Platform;
  includeImages: boolean;
  embedImages: boolean;
}

export interface PlatformExport {
  naver: {
    htmlFormat: string;
    imageHandling: 'embed' | 'upload-reference';
    maxImageSize: number;
    specialTags: string[];
    seoFields: {
      title: string;
      description: string;
      tags: string[];
      category: string;
    };
  };
  tistory: {
    markdownSupport: boolean;
    htmlFormat: string;
    imageHandling: 'base64' | 'url';
    customCss: string;
    seoFields: {
      title: string;
      description: string;
      tags: string[];
      slug: string;
    };
  };
  wordpress: {
    gutenbergBlocks: boolean;
    classicEditor: boolean;
    featuredImage: string;
    categories: string[];
    tags: string[];
    excerpt: string;
    slug: string;
    yoastSeo: {
      focusKeyword: string;
      metaDescription: string;
    };
  };
  medium: {
    format: 'markdown';
    tags: string[];
    canonicalUrl: string;
    subtitle: string;
  };
  brunch: {
    format: 'html';
    coverImage: string;
    subtitle: string;
    keywords: string[];
  };
}

// === 히스토리 타입 ===
export interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  contentSnapshot: string;
  metadata: Record<string, unknown>;
}

// === 프로젝트 타입 ===
export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'in-progress' | 'completed' | 'published';
  content: BlogContent;
  settings: ProjectSettings;
}

export interface BlogContent {
  sections: ContentSection[];
  introduction: string;
  conclusion: string;
  rawDraft: string;
  humanizedDraft: string;
  finalContent: string;
}

export interface ContentSection {
  id: string;
  heading: string;
  content: string;
  order: number;
}

export interface ProjectSettings {
  tone: ToneType;
  length: LengthType;
  platform: Platform;
  targetAudience: string;
  keywords: string[];
  selectedBloggerStyles: string[];
}

// === 스토어 입력 타입 ===
export interface BlogInput {
  topic: string;
  title: string;
  referenceText: string;
  referenceFiles: File[];
  tone: ToneType;
  length: LengthType;
  targetAudience: string;
  keywords: string[];
  category: string;
  platform: Platform;
  selectedBloggerStyles: string[];
  advancedOptions: {
    includeStatistics: boolean;
    includeExamples: boolean;
    includeQuotes: boolean;
    seoFocus: 'light' | 'balanced' | 'heavy';
    humanizeLevel: 'light' | 'moderate' | 'strong';
    imageStyle: ImageStyle;
    imageCount: number;
  };
}

// === 워크플로우 타입 ===
export type WorkflowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  isGenerating: boolean;
  progress: number;
  currentTask: string;
  errors: { step: WorkflowStep; message: string }[];
}

// === 템플릿 타입 ===
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  outline: Partial<Outline>;
  settings: Partial<BlogInput>;
  createdAt: Date;
  usageCount: number;
}

// === 메타 타입 ===
export interface BlogMeta {
  suggestedTitles: string[];
  metaDescription: string;
  hashtags: string[];
  internalLinks: SuggestedLink[];
  externalLinks: SuggestedLink[];
  schema: string;
}

export interface SuggestedLink {
  anchor: string;
  url: string;
  relevance: number;
}

// === API 응답 타입 ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StreamResponse {
  type: 'start' | 'chunk' | 'end' | 'error';
  content?: string;
  metadata?: Record<string, unknown>;
}

// === 에디터 기능 타입 ===
export interface EditorFeatures {
  formatting: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    highlight: boolean;
    textColor: boolean;
    fontSize: boolean;
    fontFamily: boolean;
  };
  blocks: {
    heading: { levels: number[] };
    paragraph: boolean;
    bulletList: boolean;
    orderedList: boolean;
    taskList: boolean;
    blockquote: boolean;
    codeBlock: { languages: string[] };
    horizontalRule: boolean;
    table: { resizable: boolean };
  };
  media: {
    image: {
      upload: boolean;
      embed: boolean;
      resize: boolean;
      caption: boolean;
      altText: boolean;
    };
    video: { embed: boolean };
    embed: { types: string[] };
  };
  aiFeatures: {
    inlineRewrite: boolean;
    expandSelection: boolean;
    summarizeSelection: boolean;
    changeTone: boolean;
    addExamples: boolean;
    addStatistics: boolean;
    factCheck: boolean;
    translateSection: boolean;
    generateImage: boolean;
  };
  collaboration: {
    comments: boolean;
    suggestions: boolean;
    versionHistory: boolean;
  };
  utilities: {
    wordCount: boolean;
    characterCount: boolean;
    readingTime: boolean;
    autoSave: { interval: number };
    undoRedo: { stackSize: number };
    search: boolean;
    findReplace: boolean;
  };
}

// === 워크플로우 단계 정보 ===
export const WORKFLOW_STEPS = [
  { step: 1 as const, title: '리서치', description: '트렌드 분석 및 주제 연구' },
  { step: 2 as const, title: '아웃라인', description: '글 구조 설계 및 편집' },
  { step: 3 as const, title: '초안 작성', description: 'AI 초안 생성 및 교차 검증' },
  { step: 4 as const, title: '이미지', description: '이미지 생성 및 배치' },
  { step: 5 as const, title: 'SEO 최적화', description: '검색 최적화 및 메타데이터' },
  { step: 6 as const, title: '휴머나이즈', description: '자연스러운 문체로 다듬기' },
  { step: 7 as const, title: '리뷰 & 내보내기', description: '최종 검토 및 발행' },
] as const;

// === 카테고리 목록 ===
export const CATEGORIES = [
  '라이프스타일',
  '테크/IT',
  '음식/요리',
  '여행',
  '육아/교육',
  '뷰티/패션',
  '재테크/투자',
  '건강/웰빙',
  '인테리어/홈',
  '자동차',
  '게임',
  '영화/드라마',
  '독서/서평',
  '운동/피트니스',
  '반려동물',
  '사진/카메라',
  '음악',
  '부동산',
  '법률/세무',
  '교육/학습',
] as const;

export type Category = typeof CATEGORIES[number];
