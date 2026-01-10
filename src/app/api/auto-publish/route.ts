import { NextRequest, NextResponse } from 'next/server';
import {
  runAutoPublish,
  getScheduleStatus,
  getRecentJobs,
  updateAutoPublishConfig,
} from '@/lib/auto-publisher';

// ============================================================
// 자동 발행 API
// GET: 상태 조회
// POST: 수동 실행 또는 설정 변경
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'jobs') {
      const count = parseInt(searchParams.get('count') || '10');
      const jobs = await getRecentJobs(count);
      return NextResponse.json({ success: true, jobs });
    }

    // 기본: 스케줄 상태 반환
    const status = await getScheduleStatus();
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Auto-publish GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '상태 조회 실패' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    switch (action) {
      case 'run':
        // 수동으로 자동 발행 실행
        const result = await runAutoPublish();
        return NextResponse.json({
          success: result.success,
          job: result.job,
          error: result.error,
        });

      case 'update-config':
        // 설정 변경
        if (!config) {
          return NextResponse.json(
            { success: false, error: '설정이 필요합니다' },
            { status: 400 }
          );
        }
        const updatedConfig = await updateAutoPublishConfig(config);
        return NextResponse.json({ success: true, config: updatedConfig });

      case 'status':
        // 상태 조회
        const status = await getScheduleStatus();
        return NextResponse.json({ success: true, status });

      default:
        return NextResponse.json(
          { success: false, error: '알 수 없는 액션' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auto-publish POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '처리 실패' },
      { status: 500 }
    );
  }
}
