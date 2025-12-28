import { NextRequest, NextResponse } from 'next/server';
import { masterWritingPrompt } from '@/lib/prompts/writing-prompts';
import { getBloggerById, mergeBloggerStyles } from '@/lib/bloggers';
import { callGemini } from '@/lib/gemini';

// ============================================================
// Draft Generation API Route
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topic,
      title,
      outline,
      tone,
      length,
      platform,
      bloggerStyles,
      advancedOptions,
      researchData,
    } = body;

    if (!topic || !title || !outline) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return mock draft for development
      return NextResponse.json({
        content: generateMockDraft(topic, title, outline),
        metadata: {
          wordCount: 2500,
          estimatedReadingTime: 5,
        },
      });
    }

    // Get blogger style information
    const bloggerProfiles = bloggerStyles?.map((id: string) => getBloggerById(id)).filter(Boolean) || [];
    const mergedStyle = bloggerProfiles.length > 0 ? mergeBloggerStyles(bloggerStyles) : null;

    // Build the prompt
    const systemPrompt = masterWritingPrompt
      .replace('{TOPIC}', topic)
      .replace('{TITLE}', title)
      .replace('{TONE}', tone || 'professional')
      .replace('{LENGTH}', length || 'medium')
      .replace('{PLATFORM}', platform || 'general')
      .replace('{BLOGGER_STYLE}', mergedStyle ? JSON.stringify(mergedStyle) : '없음')
      .replace('{ADVANCED_OPTIONS}', JSON.stringify(advancedOptions || {}));

    const userPrompt = `
아웃라인:
${JSON.stringify(outline, null, 2)}

${researchData ? `리서치 자료:\n${JSON.stringify(researchData, null, 2)}` : ''}

위 아웃라인을 기반으로 완성된 블로그 글을 작성해주세요.
HTML 형식으로 작성하되, <article> 태그 내부 내용만 반환해주세요.
`;

    let content = await callGemini(userPrompt, systemPrompt);

    // Clean up the content
    content = content.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    const wordCount = content.replace(/<[^>]+>/g, '').length;

    return NextResponse.json({
      content,
      metadata: {
        wordCount,
        estimatedReadingTime: Math.ceil(wordCount / 500),
      },
    });
  } catch (error) {
    console.error('Draft API error:', error);
    return NextResponse.json(
      { error: '초안 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function generateMockDraft(topic: string, title: string, outline: { sections: Array<{ title: string; keyPoints: string[] }> }) {
  let html = `<h1>${title}</h1>\n\n`;

  html += `<p>안녕하세요, 오늘은 <strong>${topic}</strong>에 대해 자세히 알아보겠습니다. 이 글을 통해 ${topic}의 핵심 개념부터 실용적인 활용 방법까지 모두 이해하실 수 있을 것입니다.</p>\n\n`;

  for (const section of outline.sections) {
    html += `<h2>${section.title}</h2>\n\n`;

    if (section.keyPoints && section.keyPoints.length > 0) {
      html += `<p>${section.title}에 대해 살펴보겠습니다. 이 섹션에서는 다음과 같은 내용을 다룹니다.</p>\n\n`;

      html += `<ul>\n`;
      for (const point of section.keyPoints) {
        html += `  <li><strong>${point}</strong>: ${point}에 대한 자세한 설명이 여기에 들어갑니다. 실제 API 연동 시 AI가 생성한 상세 내용이 표시됩니다.</li>\n`;
      }
      html += `</ul>\n\n`;

      html += `<p>이러한 요소들을 잘 이해하고 활용하시면 ${topic}을 더욱 효과적으로 활용하실 수 있습니다.</p>\n\n`;
    }
  }

  html += `<h2>마치며</h2>\n\n`;
  html += `<p>지금까지 ${topic}에 대해 알아보았습니다. 이 글이 여러분께 도움이 되셨기를 바랍니다. 궁금한 점이 있으시다면 댓글로 남겨주세요!</p>\n\n`;
  html += `<p>다음에도 유익한 정보로 찾아뵙겠습니다. 감사합니다. 🙏</p>`;

  return html;
}
