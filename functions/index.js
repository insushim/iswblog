/**
 * Firebase Functions - 프리미엄 자동 블로그 발행 스케줄러
 * 4시간마다 프리미엄 품질의 블로그 글을 자동 생성합니다.
 *
 * 프리미엄 기능:
 * - 품질 점수 시스템 (75점 미만 시 자동 재작성)
 * - 무료 이미지 자동 삽입 (Unsplash)
 * - 파워블로거 300명 분석 기반 글쓰기
 * - 네이버 SEO 최적화
 * - 주제 중복 방지
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const https = require('https');

// 설정
const CONFIG = {
  // BlogForge API 엔드포인트 (프리미엄 모드)
  apiUrl: 'https://blogforge-sable.vercel.app/api/cron/auto-publish',
  // 보안 토큰
  cronSecret: 'blog2026secret',
  // 한 번에 생성할 글 수 (프리미엄 모드는 품질 검증으로 시간 더 소요)
  postCount: 2,
  // 타임아웃 (초) - 프리미엄 모드는 더 긴 시간 필요
  timeoutSeconds: 540,
};

/**
 * HTTPS GET 요청 함수
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: response.statusCode, data: json });
        } catch (e) {
          resolve({ status: response.statusCode, data: data });
        }
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.setTimeout(CONFIG.timeoutSeconds * 1000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 프리미엄 자동 발행 스케줄러 - 4시간마다 실행
 *
 * 실행 시간 (한국 시간 기준):
 * - 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
 *
 * 프리미엄 모드 특징:
 * - 품질 점수 75점 이상만 발행
 * - 미달 시 자동 재작성 (최대 3회)
 * - 무료 이미지 3개 자동 삽입
 * - 파워블로거 스타일 글쓰기
 * - 네이버 SEO 최적화
 * - 주제 중복 방지
 *
 * 하루 6회 × 2글 = 12글/일 (고품질)
 */
exports.autoPublishBlog = onSchedule(
  {
    schedule: '0 */4 * * *', // 4시간마다
    timeZone: 'Asia/Seoul',
    timeoutSeconds: CONFIG.timeoutSeconds,
    memory: '512MiB', // 프리미엄 모드는 메모리 더 필요
    region: 'asia-northeast3', // 서울 리전
  },
  async (event) => {
    logger.info('🚀 프리미엄 자동 발행 시작', {
      timestamp: new Date().toISOString(),
      postCount: CONFIG.postCount,
      mode: 'premium',
      features: ['qualityScoring', 'imageInsertion', 'powerBloggerStyle', 'naverSEO', 'duplicatePrevention'],
    });

    try {
      const url = `${CONFIG.apiUrl}?token=${CONFIG.cronSecret}&count=${CONFIG.postCount}`;
      const result = await fetchUrl(url);

      if (result.status === 200 && result.data.success) {
        logger.info('✅ 프리미엄 자동 발행 성공', {
          mode: result.data.mode,
          totalRequested: result.data.totalRequested,
          successCount: result.data.successCount,
          averageQualityScore: result.data.averageQualityScore,
          results: result.data.results?.map(r => ({
            title: r.title,
            qualityScore: r.qualityScore,
            imagesInserted: r.imagesInserted,
            rewriteAttempts: r.rewriteAttempts,
          })),
        });
      } else {
        logger.error('❌ 프리미엄 자동 발행 실패', {
          status: result.status,
          error: result.data.error || result.data,
        });
      }

      return result.data;
    } catch (error) {
      logger.error('❌ 프리미엄 자동 발행 에러', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
);

/**
 * 수동 테스트용 HTTP 함수 (선택사항)
 * URL: https://asia-northeast3-iswblog-588fc.cloudfunctions.net/manualPublish
 */
const { onRequest } = require('firebase-functions/v2/https');

exports.manualPublish = onRequest(
  {
    timeoutSeconds: CONFIG.timeoutSeconds,
    memory: '256MiB',
    region: 'asia-northeast3',
  },
  async (req, res) => {
    // 간단한 인증 체크
    const authToken = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    if (authToken !== CONFIG.cronSecret) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const count = parseInt(req.query.count) || CONFIG.postCount;

    logger.info('🔧 수동 발행 시작', { count });

    try {
      const url = `${CONFIG.apiUrl}?token=${CONFIG.cronSecret}&count=${count}`;
      const result = await fetchUrl(url);

      res.json({
        success: result.status === 200 && result.data.success,
        ...result.data,
      });
    } catch (error) {
      logger.error('수동 발행 에러', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
