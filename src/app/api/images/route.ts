import { NextRequest, NextResponse } from 'next/server';
import { imagePromptGenerator } from '@/lib/prompts/writing-prompts';

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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Return mock images for development
      return NextResponse.json({
        images: generateMockImages(topic, title, sections, imageStyle, imageCount),
      });
    }

    // Generate image prompts using GPT
    const promptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: imagePromptGenerator },
          {
            role: 'user',
            content: JSON.stringify({
              topic,
              title,
              sections,
              style: imageStyle,
              count: imageCount,
            }),
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!promptResponse.ok) {
      throw new Error('프롬프트 생성 실패');
    }

    const promptData = await promptResponse.json();
    const prompts = parseImagePrompts(promptData.choices[0]?.message?.content, imageCount);

    // Generate images using DALL-E
    const images = await Promise.all(
      prompts.map(async (prompt, index) => {
        try {
          const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: prompt.prompt,
              n: 1,
              size: '1024x1024',
              quality: 'standard',
            }),
          });

          if (!imageResponse.ok) {
            throw new Error('이미지 생성 실패');
          }

          const imageData = await imageResponse.json();

          return {
            id: `img-${Date.now()}-${index}`,
            url: imageData.data[0]?.url || '',
            altText: prompt.alt || `${topic} 이미지 ${index + 1}`,
            prompt: prompt.prompt,
            style: imageStyle,
            width: 1024,
            height: 1024,
            caption: prompt.position || undefined,
            createdAt: new Date(),
          };
        } catch (error) {
          console.error('Image generation error:', error);
          return null;
        }
      })
    );

    return NextResponse.json({
      images: images.filter(Boolean),
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
