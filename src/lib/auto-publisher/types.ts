// ============================================================
// 자동 발행 시스템 타입 정의
// ============================================================

export interface AutoPublishConfig {
  // 일일 API 호출 제한
  dailyApiLimit: number;
  // 발행 간격 (시간)
  publishIntervalHours: number;
  // 활성화 여부
  enabled: boolean;
  // 발행 대상 플랫폼들
  targetPlatforms: string[];
  // 주제 카테고리들
  topicCategories: string[];
}

export interface PublishJob {
  id: string;
  topic: string;
  title: string;
  category: string;
  status: 'pending' | 'generating' | 'publishing' | 'completed' | 'failed';
  content?: string;
  createdAt: Date;
  publishedAt?: Date;
  error?: string;
  apiCallsUsed: number;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  apiCalls: number;
  postsPublished: number;
  lastUpdated: Date;
}

export interface TopicSuggestion {
  topic: string;
  title: string;
  category: string;
  keywords: string[];
  trendScore: number;
}
