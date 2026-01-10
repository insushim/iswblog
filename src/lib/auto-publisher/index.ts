// ============================================================
// 자동 발행 시스템 메인 모듈 (프리미엄 버전)
// ============================================================

// 타입
export * from './types';

// 주제 생성
export { generateTopicSuggestion, generateMultipleTopics, TOPIC_CATEGORIES, getSeasonalKeywords } from './topic-generator';

// 콘텐츠 생성
export { generateBlogContent, generateOutline, generateImagePrompts, humanizeContent } from './content-generator';

// 파워블로거 엔진 (300명 분석 기반)
export {
  generatePowerBloggerContent,
  selectTrendingTopic,
  POWER_BLOGGER_PATTERNS,
  NAVER_SEO_STRATEGIES,
  EDITING_WORKFLOW
} from './power-blogger-engine';

// 품질 점수 시스템
export {
  evaluateQuality,
  improveContent,
  logQualityScore,
  MINIMUM_QUALITY_SCORE,
  type QualityScore
} from './quality-scorer';

// 이미지 서비스
export {
  getImagesForContent,
  insertImagesIntoContent,
  generateImageHtml,
  generateImageCaptions,
  type BlogImage
} from './image-service';

// 주제 중복 방지
export {
  addRecentTopic,
  getRecentTopics,
  checkTopicSimilarity,
  generateUniqueTopic,
  getNextCategory,
  cleanupOldTopics,
  getTopicStats
} from './topic-deduplicator';

// 사용량 추적
export {
  getDailyUsage,
  incrementApiCalls,
  incrementPostsPublished,
  canMakeApiCall,
  getRemainingApiCalls,
  getAutoPublishConfig,
  updateAutoPublishConfig,
  createPublishJob,
  updatePublishJob,
  getRecentJobs,
  getPendingJobs,
  getNextPublishTime,
  shouldPublishNow,
  DEFAULT_CONFIG,
} from './usage-tracker';

// 기본 스케줄러
export { runAutoPublish, publishWithTopic, getScheduleStatus } from './scheduler';

// 프리미엄 스케줄러 (품질검증 + 이미지 + 파워블로거 스타일)
export { runPremiumAutoPublish, getPremiumScheduleStatus } from './premium-scheduler';
