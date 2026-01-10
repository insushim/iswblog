// ============================================================
// 프리미엄 자동 발행 스케줄러
// 품질 검증 + 이미지 삽입 + 파워블로거 스타일 + 중복 방지
// ============================================================

import { generateTopicSuggestion } from './topic-generator';
import { generatePowerBloggerContent } from './power-blogger-engine';
import {
  evaluateQuality,
  improveContent,
  logQualityScore,
  MINIMUM_QUALITY_SCORE,
  type QualityScore,
} from './quality-scorer';
import {
  getImagesForContent,
  insertImagesIntoContent,
  generateImageCaptions,
} from './image-service';
import {
  generateUniqueTopic,
  getRecentTopics,
  addRecentTopic,
  cleanupOldTopics,
} from './topic-deduplicator';
import {
  shouldPublishNow,
  createPublishJob,
  updatePublishJob,
  incrementPostsPublished,
  getAutoPublishConfig,
  canMakeApiCall,
  getDailyUsage,
  getRemainingApiCalls,
} from './usage-tracker';
import type { PublishJob, TopicSuggestion } from './types';

// 최대 재작성 시도 횟수
const MAX_REWRITE_ATTEMPTS = 3;

// 이미지 삽입 개수
const IMAGES_PER_POST = 3;

interface PremiumPublishResult {
  success: boolean;
  job?: PublishJob;
  qualityScore?: QualityScore;
  rewriteAttempts: number;
  imagesInserted: number;
  error?: string;
}

// 프리미엄 자동 발행 실행
export async function runPremiumAutoPublish(): Promise<PremiumPublishResult> {
  console.log('\n═══════════════════════════════════════');
  console.log('🚀 프리미엄 자동 발행 시작');
  console.log('═══════════════════════════════════════\n');

  // 오래된 주제 정리
  cleanupOldTopics(168); // 1주일 이상 된 주제 정리

  try {
    // 1. 발행 가능 여부 확인
    const shouldPublish = await shouldPublishNow();
    if (!shouldPublish) {
      console.log('[Premium] ❌ 발행 조건 미충족');
      return { success: false, rewriteAttempts: 0, imagesInserted: 0, error: '발행 조건 미충족' };
    }

    // 2. API 호출 가능 여부 확인 (품질 검증으로 인해 더 많은 호출 필요)
    const estimatedCalls = 15; // 주제 + 콘텐츠 + 품질평가 + 재작성 + 이미지
    if (!(await canMakeApiCall(estimatedCalls))) {
      console.log('[Premium] ❌ 일일 API 한도 도달');
      return { success: false, rewriteAttempts: 0, imagesInserted: 0, error: '일일 API 한도 도달' };
    }

    const config = await getAutoPublishConfig();

    // 3. 고유 주제 생성 (중복 방지)
    console.log('[Premium] 📝 고유 주제 생성 중...');
    const topic = await generateUniqueTopic(async () => {
      const generated = await generateTopicSuggestion(config.topicCategories);
      return {
        topic: generated.topic,
        category: generated.category,
        keywords: generated.keywords,
      };
    });

    const topicSuggestion: TopicSuggestion = {
      topic: topic.topic,
      title: topic.topic, // 임시 제목
      category: topic.category,
      keywords: topic.keywords,
      trendScore: 80,
    };

    console.log(`[Premium] ✅ 주제 선정: ${topic.topic}`);
    console.log(`[Premium] 📂 카테고리: ${topic.category}`);

    // 4. 발행 작업 생성
    const job = await createPublishJob({
      topic: topic.topic,
      title: topic.topic,
      category: topic.category,
      status: 'generating',
    });

    try {
      // 5. 파워블로거 스타일 콘텐츠 생성 + 품질 검증 루프
      let content: { title: string; content: string; metaDescription: string; hashtags: string[] };
      let qualityScore: QualityScore;
      let rewriteAttempts = 0;

      console.log('\n[Premium] ✍️ 파워블로거 스타일 콘텐츠 생성 중...');

      // 첫 번째 생성
      const initialContent = await generatePowerBloggerContent(topicSuggestion);
      content = {
        title: initialContent.title,
        content: initialContent.content,
        metaDescription: initialContent.metaDescription,
        hashtags: initialContent.hashtags,
      };

      console.log(`[Premium] 📊 사용된 패턴:`);
      console.log(`   서론: ${initialContent.patterns.intro}`);
      console.log(`   본론: ${initialContent.patterns.body}`);
      console.log(`   결론: ${initialContent.patterns.conclusion}`);
      console.log(`   신뢰 요소: ${initialContent.trustElements.join(', ')}`);

      // 품질 평가
      console.log('\n[Premium] 🔍 품질 평가 중...');
      qualityScore = await evaluateQuality(content.title, content.content);
      logQualityScore(qualityScore);

      // 품질 미달 시 재작성
      while (!qualityScore.passedMinimum && rewriteAttempts < MAX_REWRITE_ATTEMPTS) {
        rewriteAttempts++;
        console.log(`\n[Premium] 🔄 품질 미달 - 재작성 시도 ${rewriteAttempts}/${MAX_REWRITE_ATTEMPTS}`);
        console.log(`[Premium] 피드백: ${qualityScore.feedback.join(', ')}`);

        // 피드백 기반 개선
        const improved = await improveContent(
          content.title,
          content.content,
          qualityScore.feedback
        );
        content.title = improved.title;
        content.content = improved.content;

        // 재평가
        console.log('[Premium] 🔍 재평가 중...');
        qualityScore = await evaluateQuality(content.title, content.content);
        logQualityScore(qualityScore);
      }

      if (!qualityScore.passedMinimum) {
        console.log('[Premium] ⚠️ 최대 재작성 시도 후에도 품질 기준 미달, 그래도 진행');
      }

      // 6. 이미지 삽입
      console.log('\n[Premium] 🖼️ 이미지 삽입 중...');
      const images = await getImagesForContent(
        content.title,
        content.content,
        topic.category,
        IMAGES_PER_POST
      );

      // 이미지 캡션 생성
      const captions = await generateImageCaptions(images, topic.topic);

      // 이미지와 캡션 적용
      for (let i = 0; i < images.length && i < captions.length; i++) {
        images[i].alt = captions[i];
      }

      // 콘텐츠에 이미지 삽입
      const contentWithImages = await insertImagesIntoContent(
        content.content,
        images,
        content.title
      );

      console.log(`[Premium] ✅ ${images.length}개 이미지 삽입 완료`);

      // 7. 최종 콘텐츠 정리
      const finalContent = `
<article class="premium-blog-post">
  <header>
    <h1>${content.title}</h1>
    <meta name="description" content="${content.metaDescription}">
  </header>

  <main>
    ${contentWithImages}
  </main>

  <footer>
    <div class="hashtags">
      ${content.hashtags.join(' ')}
    </div>
    <div class="quality-badge">
      품질 점수: ${qualityScore.overall}/100
    </div>
  </footer>
</article>`;

      // 8. 발행 완료 처리
      await updatePublishJob(job.id, {
        status: 'completed',
        title: content.title,
        content: finalContent,
        publishedAt: new Date(),
        apiCallsUsed: estimatedCalls,
      });

      await incrementPostsPublished();

      // 주제 저장
      addRecentTopic(topic.topic, topic.category, topic.keywords);

      console.log('\n═══════════════════════════════════════');
      console.log('✅ 프리미엄 발행 완료!');
      console.log('═══════════════════════════════════════');
      console.log(`📝 제목: ${content.title}`);
      console.log(`📊 품질 점수: ${qualityScore.overall}/100`);
      console.log(`🔄 재작성 횟수: ${rewriteAttempts}`);
      console.log(`🖼️ 이미지: ${images.length}개`);
      console.log(`📂 카테고리: ${topic.category}`);
      console.log('═══════════════════════════════════════\n');

      return {
        success: true,
        job: {
          ...job,
          title: content.title,
          status: 'completed',
          content: finalContent,
          publishedAt: new Date(),
          apiCallsUsed: estimatedCalls,
        },
        qualityScore,
        rewriteAttempts,
        imagesInserted: images.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      await updatePublishJob(job.id, {
        status: 'failed',
        error: errorMessage,
      });

      console.error('[Premium] ❌ 발행 실패:', errorMessage);
      return {
        success: false,
        job,
        rewriteAttempts: 0,
        imagesInserted: 0,
        error: errorMessage,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('[Premium] ❌ 프로세스 오류:', errorMessage);
    return {
      success: false,
      rewriteAttempts: 0,
      imagesInserted: 0,
      error: errorMessage,
    };
  }
}

// 프리미엄 스케줄 상태 조회
export async function getPremiumScheduleStatus() {
  try {
    const config = await getAutoPublishConfig();
    const usage = await getDailyUsage();
    const remainingCalls = await getRemainingApiCalls();
    const recentTopics = getRecentTopics(undefined, 10);

    const now = new Date();
    const hours = now.getHours();
    const nextPublishHour = Math.ceil(hours / config.publishIntervalHours) * config.publishIntervalHours;
    const nextPublishTime = new Date(now);
    nextPublishTime.setHours(nextPublishHour, 0, 0, 0);

    if (nextPublishTime <= now) {
      nextPublishTime.setHours(nextPublishTime.getHours() + config.publishIntervalHours);
    }

    const msUntilNext = nextPublishTime.getTime() - now.getTime();
    const hoursUntilNext = Math.floor(msUntilNext / (1000 * 60 * 60));
    const minutesUntilNext = Math.floor((msUntilNext % (1000 * 60 * 60)) / (1000 * 60));

    return {
      enabled: config.enabled,
      mode: 'premium',
      features: {
        qualityScoring: true,
        minimumScore: MINIMUM_QUALITY_SCORE,
        maxRewriteAttempts: MAX_REWRITE_ATTEMPTS,
        imagesPerPost: IMAGES_PER_POST,
        duplicatePrevention: true,
        powerBloggerStyle: true,
        naverSeoOptimized: true,
      },
      dailyLimit: config.dailyApiLimit,
      usedToday: usage.apiCalls,
      remainingCalls,
      postsPublishedToday: usage.postsPublished,
      publishIntervalHours: config.publishIntervalHours,
      nextPublishTime: nextPublishTime.toISOString(),
      timeUntilNextPublish: `${hoursUntilNext}시간 ${minutesUntilNext}분`,
      recentTopics,
      targetPlatforms: config.targetPlatforms,
      topicCategories: config.topicCategories,
    };
  } catch (error) {
    console.error('Error getting premium schedule status:', error);
    return {
      enabled: false,
      mode: 'premium',
      error: error instanceof Error ? error.message : '상태 조회 실패',
    };
  }
}
