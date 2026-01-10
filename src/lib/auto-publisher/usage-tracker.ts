// ============================================================
// API 사용량 추적 시스템
// 인메모리 + 로컬 스토리지 기반 (서버리스 환경 호환)
// ============================================================

import type { DailyUsage, PublishJob, AutoPublishConfig } from './types';

// 오늘 날짜 문자열 (YYYY-MM-DD)
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// 기본 설정
const DEFAULT_CONFIG: AutoPublishConfig = {
  dailyApiLimit: 1000,
  publishIntervalHours: 4,
  enabled: true,
  targetPlatforms: ['naver', 'tistory'],
  topicCategories: ['tech', 'lifestyle', 'health', 'finance', 'food', 'travel'],
};

// 인메모리 저장소 (서버리스 환경에서는 요청마다 초기화됨)
let memoryUsage: DailyUsage = {
  date: getTodayDateString(),
  apiCalls: 0,
  postsPublished: 0,
  lastUpdated: new Date(),
};

let memoryJobs: PublishJob[] = [];
let memoryConfig: AutoPublishConfig = { ...DEFAULT_CONFIG };

// ============================================================
// 사용량 추적
// ============================================================

export async function getDailyUsage(): Promise<DailyUsage> {
  const today = getTodayDateString();

  // 날짜가 바뀌면 리셋
  if (memoryUsage.date !== today) {
    memoryUsage = {
      date: today,
      apiCalls: 0,
      postsPublished: 0,
      lastUpdated: new Date(),
    };
  }

  return memoryUsage;
}

export async function incrementApiCalls(count: number = 1): Promise<DailyUsage> {
  const today = getTodayDateString();

  if (memoryUsage.date !== today) {
    memoryUsage = {
      date: today,
      apiCalls: 0,
      postsPublished: 0,
      lastUpdated: new Date(),
    };
  }

  memoryUsage.apiCalls += count;
  memoryUsage.lastUpdated = new Date();

  return memoryUsage;
}

export async function incrementPostsPublished(): Promise<DailyUsage> {
  memoryUsage.postsPublished += 1;
  memoryUsage.lastUpdated = new Date();
  return memoryUsage;
}

export async function canMakeApiCall(estimatedCalls: number = 1): Promise<boolean> {
  const usage = await getDailyUsage();
  return usage.apiCalls + estimatedCalls <= memoryConfig.dailyApiLimit;
}

export async function getRemainingApiCalls(): Promise<number> {
  const usage = await getDailyUsage();
  return Math.max(0, memoryConfig.dailyApiLimit - usage.apiCalls);
}

// ============================================================
// 자동 발행 설정
// ============================================================

export async function getAutoPublishConfig(): Promise<AutoPublishConfig> {
  return memoryConfig;
}

export async function updateAutoPublishConfig(
  config: Partial<AutoPublishConfig>
): Promise<AutoPublishConfig> {
  memoryConfig = { ...memoryConfig, ...config };
  return memoryConfig;
}

// ============================================================
// 발행 작업 관리
// ============================================================

export async function createPublishJob(
  job: Omit<PublishJob, 'id' | 'createdAt' | 'apiCallsUsed'>
): Promise<PublishJob> {
  const newJob: PublishJob = {
    ...job,
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    apiCallsUsed: 0,
  };

  memoryJobs.unshift(newJob);

  // 최대 100개까지만 유지
  if (memoryJobs.length > 100) {
    memoryJobs = memoryJobs.slice(0, 100);
  }

  return newJob;
}

export async function updatePublishJob(
  jobId: string,
  updates: Partial<PublishJob>
): Promise<void> {
  const index = memoryJobs.findIndex(j => j.id === jobId);
  if (index !== -1) {
    memoryJobs[index] = { ...memoryJobs[index], ...updates };
  }
}

export async function getRecentJobs(count: number = 10): Promise<PublishJob[]> {
  return memoryJobs.slice(0, count);
}

export async function getPendingJobs(): Promise<PublishJob[]> {
  return memoryJobs.filter(j => j.status === 'pending' || j.status === 'generating');
}

// ============================================================
// 스케줄 계산
// ============================================================

export async function getNextPublishTime(): Promise<Date> {
  const recentJobs = await getRecentJobs(1);

  if (recentJobs.length === 0) {
    return new Date();
  }

  const lastJob = recentJobs[0];
  const lastPublishTime = lastJob.publishedAt || lastJob.createdAt;
  const nextTime = new Date(lastPublishTime);
  nextTime.setHours(nextTime.getHours() + memoryConfig.publishIntervalHours);

  if (nextTime < new Date()) {
    return new Date();
  }

  return nextTime;
}

export async function shouldPublishNow(): Promise<boolean> {
  if (!memoryConfig.enabled) {
    return false;
  }

  const canCall = await canMakeApiCall(10);
  if (!canCall) {
    console.log('[AutoPublish] 일일 API 한도 도달');
    return false;
  }

  return true;
}

export { DEFAULT_CONFIG };
