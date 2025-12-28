// ============================================================
// Gemini API Client
// ============================================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-2.5-pro-preview-06-05';

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API 요청 실패: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini API 응답이 비어있습니다.');
  }

  return data.candidates[0].content.parts[0].text;
}

export default callGemini;
