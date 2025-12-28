import { NextRequest, NextResponse } from 'next/server';
import { imagePromptGenerator } from '@/lib/prompts/writing-prompts';
import { callGemini } from '@/lib/gemini';

// ============================================================
// Image Generation API Route
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, title, sections, style, count } = body;

    if (!topic) {
      return NextResponse.json(
        { error: '주제가 없습니다.' },
        { status: 400 }
      );
    }

    const imageCount = Math.min(count || 3, 10);
    const imageStyle = style || 'photorealistic';

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return mock images for development
      return NextResponse.json({
        images: generateMockImages(topic, title, sections, imageStyle, imageCount),
      });
    }

    // Generate image prompts using Gemini
    const userPrompt = JSON.stringify({
      topic,
      title,
      sections,
      style: imageStyle,
      count: imageCount,
    });

    const promptContent = await callGemini(userPrompt, imagePromptGenerator);
    const prompts = parseImagePrompts(promptContent, imageCount);

    // Return prompts with placeholder images (actual image generation would require a separate image API)
    const images = prompts.map((prompt, index) => {
      const color = ['667eea', '764ba2', 'f093fb', 'f5576c', 'fda085', '4facfe'][index % 6];
      return {
        id: `img-${Date.now()}-${index}`,
        url: `https://placehold.co/1024x1024/${color}/ffffff?text=${encodeURIComponent(prompt.alt.slice(0, 20))}`,
        altText: prompt.alt || `${topic} 이미지 ${index + 1}`,
        prompt: prompt.prompt,
        style: imageStyle,
        width: 1024,
        height: 1024,
        caption: prompt.position || undefined,
        createdAt: new Date(),
      };
    });

    return NextResponse.json({
      images,
      prompts, // Return prompts for manual image generation if needed
    });
  } catch (error) {
    console.error('Images API error:', error);
    return NextResponse.json(
      { error: '이미지 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

interface ImagePrompt {
  prompt: string;
  alt: string;
  position: string;
}

function parseImagePrompts(content: string, count: number): ImagePrompt[] {
  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(content);
  } catch {
    // Generate default prompts
    return Array.from({ length: count }, (_, i) => ({
      prompt: `Professional blog image for ${i === 0 ? 'header' : `section ${i}`}`,
      alt: `블로그 이미지 ${i + 1}`,
      position: i === 0 ? 'header' : `section-${i}`,
    }));
  }
}

function generateMockImages(
  topic: string,
  title: string,
  sections: Array<{ title: string }> | undefined,
  style: string,
  count: number
) {
  const positions = ['header', ...Array.from({ length: count - 1 }, (_, i) => `section-${i + 1}`)];

  // Use placeholder images
  const placeholderColors = ['667eea', '764ba2', 'f093fb', 'f5576c', 'fda085', '4facfe'];

  return positions.slice(0, count).map((position, index) => {
    const color = placeholderColors[index % placeholderColors.length];
    const sectionTitle = sections?.[index]?.title || topic;

    return {
      id: `img-${Date.now()}-${index}`,
      url: `https://placehold.co/1024x1024/${color}/ffffff?text=${encodeURIComponent(sectionTitle.slice(0, 20))}`,
      altText: `${title} - ${position === 'header' ? '대표 이미지' : sectionTitle}`,
      prompt: `${style} style image for: ${sectionTitle}`,
      style,
      width: 1024,
      height: 1024,
      caption: position,
      createdAt: new Date(),
    };
  });
}
