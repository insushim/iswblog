import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Image Search API - Pexels API를 사용한 키워드 기반 이미지 검색
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const index = searchParams.get('index') || '0';

    if (!query) {
      return NextResponse.json(
        { error: '검색 키워드가 필요합니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
      // API 키가 없으면 Lorem Picsum 폴백
      const seed = hashCode(query + index);
      return NextResponse.json({
        url: `https://picsum.photos/seed/${seed}/800/450`,
        alt: query,
        source: 'picsum',
      });
    }

    // Pexels API 호출
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&page=1`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      // index에 따라 다른 이미지 선택
      const photoIndex = parseInt(index) % data.photos.length;
      const photo = data.photos[photoIndex];

      return NextResponse.json({
        url: photo.src.large, // 940px width
        alt: photo.alt || query,
        photographer: photo.photographer,
        source: 'pexels',
      });
    }

    // 검색 결과가 없으면 Lorem Picsum 폴백
    const seed = hashCode(query + index);
    return NextResponse.json({
      url: `https://picsum.photos/seed/${seed}/800/450`,
      alt: query,
      source: 'picsum',
    });
  } catch (error) {
    console.error('[Image Search API] Error:', error);

    // 에러 시 Lorem Picsum 폴백
    const query = new URL(request.url).searchParams.get('query') || 'blog';
    const index = new URL(request.url).searchParams.get('index') || '0';
    const seed = hashCode(query + index);

    return NextResponse.json({
      url: `https://picsum.photos/seed/${seed}/800/450`,
      alt: query,
      source: 'picsum',
    });
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
