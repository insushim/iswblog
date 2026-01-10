import { NextRequest, NextResponse } from 'next/server';
import { runPremiumAutoPublish, getPremiumScheduleStatus } from '@/lib/auto-publisher';

// ============================================================
// 프리미엄 Cron Job API for Auto Publishing
// 품질 검증 + 이미지 + 파워블로거 스타일
// ============================================================

// 보안 토큰 검증
function validateToken(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // CRON_SECRET이 설정되지 않으면 검증 건너뛰기
  if (!cronSecret) return true;

  // Authorization 헤더 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) return true;

  // URL 파라미터로 토큰 확인 (cron-job.org 호환)
  const { searchParams } = new URL(request.url);
  const tokenParam = searchParams.get('token');
  if (tokenParam === cronSecret) return true;

  return false;
}

export async function GET(request: NextRequest) {
  // 보안 검증
  if (!validateToken(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '1');
  const mode = searchParams.get('mode') || 'premium'; // premium 또는 basic

  console.log(`\n═══════════════════════════════════════`);
  console.log(`🚀 [Cron] 프리미엄 자동 발행 시작`);
  console.log(`   요청 수: ${count}개`);
  console.log(`   모드: ${mode}`);
  console.log(`═══════════════════════════════════════\n`);

  try {
    const results = [];
    const maxCount = Math.min(count, 3); // 프리미엄 모드는 품질 검증으로 시간이 더 걸려서 최대 3개

    for (let i = 0; i < maxCount; i++) {
      console.log(`\n[Cron] 📝 ${i + 1}/${maxCount} 프리미엄 글 생성 중...`);

      const result = await runPremiumAutoPublish();

      results.push({
        index: i + 1,
        success: result.success,
        title: result.job?.title,
        category: result.job?.category,
        qualityScore: result.qualityScore?.overall,
        qualityBreakdown: result.qualityScore?.breakdown,
        rewriteAttempts: result.rewriteAttempts,
        imagesInserted: result.imagesInserted,
        error: result.error,
      });

      // 연속 호출 시 대기 (API 제한 방지 + 서버 부하 분산)
      if (i < maxCount - 1) {
        console.log('[Cron] ⏳ 다음 글 생성 전 5초 대기...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const avgQuality = results
      .filter(r => r.qualityScore)
      .reduce((sum, r) => sum + (r.qualityScore || 0), 0) / (results.filter(r => r.qualityScore).length || 1);

    console.log(`\n═══════════════════════════════════════`);
    console.log(`✅ [Cron] 완료: ${successCount}/${maxCount} 성공`);
    console.log(`📊 평균 품질 점수: ${Math.round(avgQuality)}/100`);
    console.log(`═══════════════════════════════════════\n`);

    return NextResponse.json({
      success: successCount > 0,
      mode: 'premium',
      features: {
        qualityScoring: true,
        autoRewrite: true,
        imageInsertion: true,
        powerBloggerStyle: true,
        naverSeoOptimized: true,
        duplicatePrevention: true,
      },
      totalRequested: maxCount,
      successCount,
      averageQualityScore: Math.round(avgQuality),
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] ❌ 오류:', error);
    return NextResponse.json(
      {
        success: false,
        mode: 'premium',
        error: error instanceof Error ? error.message : '프리미엄 자동 발행 실패',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST도 지원
export async function POST(request: NextRequest) {
  return GET(request);
}
