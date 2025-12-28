import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================
// Utility Functions
// ============================================================

/**
 * 클래스명 병합 유틸리티
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 단어 수 계산
 */
export function countWords(text: string): number {
  if (!text) return 0;
  // 한글과 영어 모두 고려
  const koreanWords = text.match(/[\uAC00-\uD7AF]+/g) || [];
  const englishWords = text.match(/[a-zA-Z]+/g) || [];
  return koreanWords.length + englishWords.length;
}

/**
 * 글자 수 계산 (공백 제외)
 */
export function countCharacters(text: string, excludeSpaces = true): number {
  if (!text) return 0;
  return excludeSpaces ? text.replace(/\s/g, '').length : text.length;
}

/**
 * 읽기 시간 추정 (분)
 */
export function estimateReadingTime(text: string): number {
  const words = countWords(text);
  // 한국어 평균 읽기 속도: 분당 약 400-500자
  // 영어 평균 읽기 속도: 분당 약 200-250단어
  const avgSpeed = 400;
  return Math.ceil(words / avgSpeed);
}

/**
 * 문자열 줄임
 */
export function truncate(text: string, length: number, suffix = '...'): string {
  if (!text || text.length <= length) return text;
  return text.slice(0, length - suffix.length) + suffix;
}

/**
 * 슬러그 생성
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 날짜 포맷팅
 */
export function formatDate(date: Date | string, format: 'full' | 'short' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
  }

  if (format === 'full') {
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 숫자 포맷팅 (K, M 단위)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 키워드 밀도 계산
 */
export function calculateKeywordDensity(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const keywordCount = (lowerText.match(new RegExp(lowerKeyword, 'g')) || []).length;
  const totalWords = countWords(text);
  return totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
}

/**
 * HTML 이스케이프
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * HTML 태그 제거
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * 마크다운을 플레인 텍스트로 변환
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s/g, '') // 헤딩
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 볼드
    .replace(/\*([^*]+)\*/g, '$1') // 이탤릭
    .replace(/`([^`]+)`/g, '$1') // 인라인 코드
    .replace(/```[\s\S]*?```/g, '') // 코드 블록
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // 이미지
    .replace(/^[-*+]\s/gm, '') // 리스트
    .replace(/^\d+\.\s/gm, '') // 순서 리스트
    .replace(/^>\s/gm, '') // 인용
    .replace(/---/g, '') // 구분선
    .trim();
}

/**
 * 딥 클론
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 디바운스
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 쓰로틀
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * UUID 생성 (간단한 버전)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * 배열 청크 분할
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 객체 필터링
 */
export function filterObject<T extends object>(
  obj: T,
  predicate: (key: keyof T, value: T[keyof T]) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (predicate(key, obj[key])) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * 안전한 JSON 파싱
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * 플랫폼별 줄바꿈 변환
 */
export function normalizeLineBreaks(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * 색상 밝기 계산 (0-255)
 */
export function getColorBrightness(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * 점수를 등급으로 변환
 */
export function scoreToGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'C+';
  if (score >= 65) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * 점수에 따른 색상
 */
export function scoreToColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * 파일 확장자 추출
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * 파일 크기 포맷팅
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 문장 분할
 */
export function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

/**
 * 문단 분할
 */
export function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).filter(Boolean);
}

/**
 * 평균 문장 길이 계산
 */
export function averageSentenceLength(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + countWords(s), 0);
  return Math.round(totalWords / sentences.length);
}

/**
 * 복사 가능 여부 확인
 */
export function isClipboardSupported(): boolean {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator;
}

/**
 * 로컬 스토리지 유틸리티
 */
export const storage = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    const item = localStorage.getItem(key);
    return item ? safeJsonParse(item, fallback) : fallback;
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

/**
 * 랜덤 요소 선택
 */
export function randomPick<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 배열 셔플
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 대기 함수
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 재시도 함수
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  delay: number
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await sleep(delay * attempt);
      }
    }
  }
  throw lastError;
}
