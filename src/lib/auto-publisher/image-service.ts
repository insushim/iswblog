// ============================================================
// 무료 이미지 서비스 - Unsplash & Pexels API
// 글 내용에 맞는 고품질 무료 이미지 자동 삽입
// ============================================================

import { callGemini } from '@/lib/gemini';

export interface BlogImage {
  url: string;
  alt: string;
  credit: string;
  creditUrl: string;
  width: number;
  height: number;
  position: 'header' | 'inline' | 'section';
}

// Unsplash API (무료, 월 50회 → 실제로는 시간당 50회)
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

// Pexels API (무료, 월 20,000회)
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

// 키워드 추출 프롬프트
async function extractImageKeywords(
  title: string,
  content: string,
  category: string
): Promise<string[]> {
  const prompt = `블로그 글에 어울리는 이미지 검색 키워드를 추출해주세요.

제목: ${title}
카테고리: ${category}
본문 일부: ${content.substring(0, 1000)}

요구사항:
1. 영어 키워드로 5개 추출
2. Unsplash/Pexels에서 검색 가능한 일반적인 키워드
3. 글의 분위기와 주제에 맞는 이미지를 찾을 수 있는 키워드
4. 너무 구체적이지 않게 (검색 결과가 나와야 함)

JSON 배열로만 응답:
["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]`;

  try {
    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Keyword extraction error:', error);
  }

  // 카테고리 기반 기본 키워드
  const categoryKeywords: Record<string, string[]> = {
    '기술/IT': ['technology', 'computer', 'digital', 'coding', 'innovation'],
    '라이프스타일': ['lifestyle', 'home', 'wellness', 'minimal', 'daily'],
    '건강/운동': ['fitness', 'health', 'exercise', 'wellness', 'sport'],
    '재테크/경제': ['finance', 'money', 'business', 'investment', 'success'],
    '음식/요리': ['food', 'cooking', 'kitchen', 'delicious', 'recipe'],
    '여행/문화': ['travel', 'adventure', 'nature', 'culture', 'explore'],
    '뷰티/패션': ['beauty', 'fashion', 'style', 'makeup', 'skincare'],
    '교육/학습': ['education', 'study', 'learning', 'book', 'knowledge'],
  };

  return categoryKeywords[category] || ['blog', 'article', 'content', 'information', 'guide'];
}

// Unsplash에서 이미지 검색
async function searchUnsplash(keyword: string): Promise<BlogImage | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('[Image] Unsplash API key not set, using fallback');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Unsplash API error:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // 랜덤하게 선택
      const photo = data.results[Math.floor(Math.random() * Math.min(data.results.length, 5))];
      return {
        url: photo.urls.regular,
        alt: photo.alt_description || keyword,
        credit: photo.user.name,
        creditUrl: photo.user.links.html,
        width: photo.width,
        height: photo.height,
        position: 'inline',
      };
    }
  } catch (error) {
    console.error('Unsplash search error:', error);
  }

  return null;
}

// Pexels에서 이미지 검색
async function searchPexels(keyword: string): Promise<BlogImage | null> {
  if (!PEXELS_API_KEY) {
    console.log('[Image] Pexels API key not set, using fallback');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error('Pexels API error:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[Math.floor(Math.random() * Math.min(data.photos.length, 5))];
      return {
        url: photo.src.large,
        alt: photo.alt || keyword,
        credit: photo.photographer,
        creditUrl: photo.photographer_url,
        width: photo.width,
        height: photo.height,
        position: 'inline',
      };
    }
  } catch (error) {
    console.error('Pexels search error:', error);
  }

  return null;
}

// 고품질 무료 이미지 placeholder (API 키 없을 때)
function getPlaceholderImage(keyword: string, index: number): BlogImage {
  // Unsplash Source (API 키 불필요, 직접 URL)
  const width = 1200;
  const height = 630;

  return {
    url: `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}`,
    alt: keyword,
    credit: 'Unsplash',
    creditUrl: 'https://unsplash.com',
    width,
    height,
    position: index === 0 ? 'header' : 'inline',
  };
}

// 글에 필요한 이미지들 가져오기
export async function getImagesForContent(
  title: string,
  content: string,
  category: string,
  imageCount: number = 3
): Promise<BlogImage[]> {
  console.log(`[Image] ${imageCount}개 이미지 검색 중...`);

  const keywords = await extractImageKeywords(title, content, category);
  const images: BlogImage[] = [];

  for (let i = 0; i < Math.min(imageCount, keywords.length); i++) {
    const keyword = keywords[i];

    // Unsplash 먼저 시도
    let image = await searchUnsplash(keyword);

    // 실패하면 Pexels
    if (!image) {
      image = await searchPexels(keyword);
    }

    // 둘 다 실패하면 placeholder
    if (!image) {
      image = getPlaceholderImage(keyword, i);
    }

    // 위치 설정
    image.position = i === 0 ? 'header' : 'inline';
    images.push(image);

    // API 제한 방지
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`[Image] ${images.length}개 이미지 확보 완료`);
  return images;
}

// 이미지 HTML 생성 (파워블로거 스타일)
export function generateImageHtml(image: BlogImage, caption?: string): string {
  const captionText = caption || image.alt;

  return `
<figure class="blog-image ${image.position}">
  <img
    src="${image.url}"
    alt="${image.alt}"
    loading="lazy"
    style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin: 20px auto; display: block;"
  />
  <figcaption style="text-align: center; font-size: 14px; color: #666; margin-top: 8px;">
    ${captionText}
    <span style="font-size: 12px; color: #999;">
      (Photo by <a href="${image.creditUrl}" target="_blank" rel="noopener">${image.credit}</a>)
    </span>
  </figcaption>
</figure>`;
}

// 콘텐츠에 이미지 삽입 (전략적 배치)
export async function insertImagesIntoContent(
  content: string,
  images: BlogImage[],
  title: string
): Promise<string> {
  if (images.length === 0) return content;

  // 헤더 이미지 (첫 번째)
  const headerImage = images[0];
  const headerHtml = generateImageHtml(headerImage, title);

  // 본문 이미지들 (나머지)
  const inlineImages = images.slice(1);

  // h2, h3 태그 찾기
  const headingPattern = /<h[23][^>]*>.*?<\/h[23]>/gi;
  const headings = content.match(headingPattern) || [];

  let result = headerHtml + '\n\n' + content;

  // 각 섹션 사이에 이미지 삽입 (균등 배치)
  if (inlineImages.length > 0 && headings.length > 1) {
    const interval = Math.floor(headings.length / (inlineImages.length + 1));

    for (let i = 0; i < inlineImages.length; i++) {
      const targetIndex = (i + 1) * interval;
      if (targetIndex < headings.length) {
        const heading = headings[targetIndex];
        const imageHtml = generateImageHtml(inlineImages[i]);
        result = result.replace(heading, imageHtml + '\n\n' + heading);
      }
    }
  }

  return result;
}

// 이미지 최적화 팁 생성 (AI)
export async function generateImageCaptions(
  images: BlogImage[],
  topic: string
): Promise<string[]> {
  const prompt = `블로그 이미지에 어울리는 한국어 캡션을 생성해주세요.

주제: ${topic}
이미지 수: ${images.length}

요구사항:
- 짧고 임팩트 있는 캡션 (15자 이내)
- 독자의 시선을 끄는 문구
- 글의 내용과 연결되는 설명

JSON 배열로 응답:
["캡션1", "캡션2", "캡션3"]`;

  try {
    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Caption generation error:', error);
  }

  return images.map((_, i) => `이미지 ${i + 1}`);
}
