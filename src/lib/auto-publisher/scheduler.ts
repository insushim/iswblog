// ============================================================
// 자동 발행 스케줄러
// 주기적으로 글을 생성하고 발행하는 메인 로직
// ============================================================

import { generateTopicSuggestion } from './topic-generator';
import { generateBlogContent, humanizeContent } from './content-generator';
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

interface PublishResult {
  success: boolean;
  job?: PublishJob;
  error?: string;
}

// 자동 발행 실행
export async function runAutoPublish(): Promise<PublishResult> {
  console.log('[AutoPublish] 자동 발행 프로세스 시작...');

  try {
    // 1. 발행 가능 여부 확인
    const shouldPublish = await shouldPublishNow();
    if (!shouldPublish) {
      console.log('[AutoPublish] 발행 조건 미충족');
      return { success: false, error: '발행 조건 미충족' };
    }

    // 2. API 호출 가능 여부 확인
    const estimatedCalls = 5; // 주제 생성 + 콘텐츠 생성 + 휴머나이징
    if (!(await canMakeApiCall(estimatedCalls))) {
      console.log('[AutoPublish] 일일 API 한도 도달');
      return { success: false, error: '일일 API 한도 도달' };
    }

    const config = await getAutoPublishConfig();

    // 3. 주제 생성
    console.log('[AutoPublish] 주제 생성 중...');
    const topic = await generateTopicSuggestion(config.topicCategories);
    console.log(`[AutoPublish] 생성된 주제: ${topic.title}`);

    // 4. 발행 작업 생성
    const job = await createPublishJob({
      topic: topic.topic,
      title: topic.title,
      category: topic.category,
      status: 'generating',
    });

    try {
      // 5. 콘텐츠 생성
      console.log('[AutoPublish] 콘텐츠 생성 중...');
      await updatePublishJob(job.id, { status: 'generating' });

      const content = await generateBlogContent(topic);
      console.log(`[AutoPublish] 콘텐츠 생성 완료: ${content.wordCount}자`);

      // 6. 휴머나이징 (선택사항)
      console.log('[AutoPublish] 휴머나이징 중...');
      const humanizedContent = await humanizeContent(content.content);

      // 7. 발행 완료 처리
      await updatePublishJob(job.id, {
        status: 'completed',
        content: humanizedContent,
        publishedAt: new Date(),
        apiCallsUsed: estimatedCalls,
      });

      await incrementPostsPublished();

      console.log('[AutoPublish] 발행 완료!');

      return {
        success: true,
        job: {
          ...job,
          status: 'completed',
          content: humanizedContent,
          publishedAt: new Date(),
          apiCallsUsed: estimatedCalls,
        },
      };
    } catch (error) {
      // 실패 처리
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      await updatePublishJob(job.id, {
        status: 'failed',
        error: errorMessage,
      });

      console.error('[AutoPublish] 발행 실패:', errorMessage);
      return { success: false, job, error: errorMessage };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('[AutoPublish] 프로세스 오류:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// 수동 발행 (특정 주제로)
export async function publishWithTopic(topic: TopicSuggestion): Promise<PublishResult> {
  console.log(`[ManualPublish] "${topic.title}" 발행 시작...`);

  try {
    if (!(await canMakeApiCall(5))) {
      return { success: false, error: '일일 API 한도 도달' };
    }

    const job = await createPublishJob({
      topic: topic.topic,
      title: topic.title,
      category: topic.category,
      status: 'generating',
    });

    try {
      const content = await generateBlogContent(topic);
      const humanizedContent = await humanizeContent(content.content);

      await updatePublishJob(job.id, {
        status: 'completed',
        content: humanizedContent,
        publishedAt: new Date(),
        apiCallsUsed: 5,
      });

      await incrementPostsPublished();

      return {
        success: true,
        job: {
          ...job,
          status: 'completed',
          content: humanizedContent,
          publishedAt: new Date(),
          apiCallsUsed: 5,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      await updatePublishJob(job.id, {
        status: 'failed',
        error: errorMessage,
      });
      return { success: false, job, error: errorMessage };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return { success: false, error: errorMessage };
  }
}

// 스케줄 상태 조회
export async function getScheduleStatus() {
  try {
    const config = await getAutoPublishConfig();
    const usage = await getDailyUsage();
    const remainingCalls = await getRemainingApiCalls();

    // 다음 발행까지 남은 시간 계산
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
      dailyLimit: config.dailyApiLimit,
      usedToday: usage.apiCalls,
      remainingCalls,
      postsPublishedToday: usage.postsPublished,
      publishIntervalHours: config.publishIntervalHours,
      nextPublishTime: nextPublishTime.toISOString(),
      timeUntilNextPublish: `${hoursUntilNext}시간 ${minutesUntilNext}분`,
      targetPlatforms: config.targetPlatforms,
      topicCategories: config.topicCategories,
    };
  } catch (error) {
    console.error('Error getting schedule status:', error);
    return {
      enabled: false,
      error: error instanceof Error ? error.message : '상태 조회 실패',
    };
  }
}
