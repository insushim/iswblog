import { NextRequest, NextResponse } from 'next/server';
import { seoOptimizationPrompt } from '@/lib/prompts/writing-prompts';
import { callGemini } from '@/lib/gemini';

// ============================================================
// SEO Optimization API Route
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, keywords, platform } = body;

    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠가 없습니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return mock SEO analysis and optimized content
      return NextResponse.json({
        optimizedContent: content,
        analysis: generateMockSEOAnalysis(content, keywords || []),
        meta: generateMockMeta(title, content),
      });
    }

    const userPrompt = JSON.stringify({
      content,
      title,
      keywords,
      platform,
    });

    const responseContent = await callGemini(userPrompt, seoOptimizationPrompt);
    const result = parseSeOResponse(responseContent, content, title, keywords || []);

    return NextResponse.json(result);
  } catch (error) {
    console.error('SEO API error:', error);
    return NextResponse.json(
      { error: 'SEO 최적화 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function parseSeOResponse(responseContent: string, originalContent: string, title: string, keywords: string[]) {
  try {
    const jsonMatch = responseContent.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(responseContent);
  } catch {
    return {
      optimizedContent: originalContent,
      analysis: generateMockSEOAnalysis(originalContent, keywords),
      meta: generateMockMeta(title, originalContent),
    };
  }
}

function generateMockSEOAnalysis(content: string, keywords: string[]) {
  const plainText = content.replace(/<[^>]+>/g, '');
  const wordCount = plainText.length;
  const headingsCount = (content.match(/<h[1-6][^>]*>/g) || []).length;
  const paragraphsCount = (content.match(/<p[^>]*>/g) || []).length;
  const imagesCount = (content.match(/<img[^>]*>/g) || []).length;
  const linksCount = (content.match(/<a[^>]*>/g) || []).length;

  // Calculate keyword density
  let keywordCount = 0;
  for (const keyword of keywords) {
    const regex = new RegExp(keyword, 'gi');
    keywordCount += (plainText.match(regex) || []).length;
  }
  const keywordDensity = (keywordCount / (wordCount / 100)) || 0;

  // Generate suggestions
  const suggestions: string[] = [];

  if (headingsCount < 3) {
    suggestions.push('제목(H2, H3)을 더 추가하여 구조를 개선하세요.');
  }
  if (keywordDensity < 0.5) {
    suggestions.push('주요 키워드 사용 빈도를 높이세요.');
  } else if (keywordDensity > 3) {
    suggestions.push('키워드 과다 사용에 주의하세요.');
  }
  if (imagesCount === 0) {
    suggestions.push('이미지를 추가하여 시각적 효과를 높이세요.');
  }
  if (wordCount < 1000) {
    suggestions.push('콘텐츠 길이를 늘려 깊이 있는 정보를 제공하세요.');
  }
  if (linksCount === 0) {
    suggestions.push('관련 링크를 추가하여 신뢰성을 높이세요.');
  }

  // Calculate score
  let score = 50;
  score += Math.min(20, headingsCount * 5);
  score += keywordDensity >= 0.5 && keywordDensity <= 2.5 ? 15 : 0;
  score += imagesCount > 0 ? 10 : 0;
  score += wordCount >= 1500 ? 10 : wordCount >= 1000 ? 5 : 0;
  score -= suggestions.length * 5;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    keywords: keywords.length > 0 ? keywords : extractKeywords(plainText),
    keywordDensity: Number(keywordDensity.toFixed(2)),
    readabilityScore: calculateReadabilityScore(plainText),
    headingsCount,
    paragraphsCount,
    imagesCount,
    linksCount,
    metaDescription: '',
    suggestions,
  };
}

function generateMockMeta(title: string, content: string) {
  const plainText = content.replace(/<[^>]+>/g, '');
  const description = plainText.slice(0, 150).replace(/\s+/g, ' ').trim() + '...';

  return {
    description,
    keywords: extractKeywords(plainText),
    ogTitle: title,
    ogDescription: description,
    ogImage: '',
    canonicalUrl: '',
    structuredData: null,
  };
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/[가-힣a-z]{2,}/g) || [];
  const frequency: Record<string, number> = {};

  // Common stop words in Korean
  const stopWords = ['그리고', '하지만', '그래서', '따라서', '그러나', '또한', '이것', '저것', '여기', '거기'];

  for (const word of words) {
    if (!stopWords.includes(word) && word.length > 1) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?。]+/).filter(s => s.trim());
  const avgSentenceLength = text.length / Math.max(1, sentences.length);

  // Korean text readability - shorter sentences are better
  if (avgSentenceLength < 40) return 90;
  if (avgSentenceLength < 60) return 80;
  if (avgSentenceLength < 80) return 70;
  if (avgSentenceLength < 100) return 60;
  return 50;
}
