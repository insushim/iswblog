// ============================================================
// Gemini API Client - Gemini 2.5 Flash 모델 사용
// 최신 모델로 고품질 콘텐츠 생성
// ============================================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-3-flash-preview';

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
    finishReason?: string;
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface GeminiOptions {
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
}

// 기본 Gemini 호출
export async function callGemini(
  prompt: string,
  systemPrompt?: string,
  options?: GeminiOptions
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
  }

  const contents = [];

  if (systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: `[시스템 지시사항]\n${systemPrompt}\n\n[사용자 요청]\n${prompt}` }],
    });
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });
  }

  const response = await fetch(
    `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.8,
          topK: options?.topK ?? 40,
          topP: options?.topP ?? 0.95,
          maxOutputTokens: options?.maxOutputTokens ?? 16384,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API 요청 실패: ${response.status} - ${error}`);
  }

  const data: GeminiResponse = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini API 응답이 비어있습니다.');
  }

  const text = data.candidates[0].content.parts[0].text;

  // 토큰 사용량 로깅
  if (data.usageMetadata) {
    console.log(`[Gemini] 토큰 사용: ${data.usageMetadata.totalTokenCount}`);
  }

  return text;
}

// 고품질 콘텐츠 생성용 (더 높은 토큰, 창의성)
export async function callGeminiPremium(prompt: string, systemPrompt?: string): Promise<string> {
  return callGemini(prompt, systemPrompt, {
    temperature: 0.9,
    maxOutputTokens: 32768,
    topP: 0.98,
  });
}

// JSON 응답 전용 (낮은 창의성, 정확한 포맷)
export async function callGeminiJSON(prompt: string): Promise<string> {
  return callGemini(prompt, undefined, {
    temperature: 0.3,
    maxOutputTokens: 8192,
  });
}

export default callGemini;
