// ============================================================
// 교차검증 리서치 시스템
// 10개 이상 공신력 있는 출처에서 정보 수집 및 검증
// ============================================================

import { callGemini, callGeminiPremium } from './gemini';

// 공신력 있는 출처 도메인 목록
const TRUSTED_DOMAINS = {
  // 정부/공공기관
  government: [
    'go.kr',           // 한국 정부
    'gov.kr',          // 정부24
    'korea.kr',        // 대한민국 정책브리핑
    'bok.or.kr',       // 한국은행
    'kosis.kr',        // 통계청
    'kostat.go.kr',    // 통계청
    'mohw.go.kr',      // 보건복지부
    'moel.go.kr',      // 고용노동부
    'mof.go.kr',       // 기획재정부
  ],
  // 연구기관
  research: [
    'kdi.re.kr',       // 한국개발연구원
    'kiep.go.kr',      // 대외경제정책연구원
    'kihasa.re.kr',    // 한국보건사회연구원
    'krihs.re.kr',     // 국토연구원
    'stepi.re.kr',     // 과학기술정책연구원
  ],
  // 언론사
  media: [
    'chosun.com',
    'donga.com',
    'hani.co.kr',
    'khan.co.kr',
    'mk.co.kr',
    'mt.co.kr',
    'yonhapnews.co.kr',
    'yna.co.kr',
  ],
  // 학술/교육
  academic: [
    'riss.kr',         // 학술연구정보서비스
    'dbpia.co.kr',     // DBpia
    'scholar.google.com',
    '.edu',
    '.ac.kr',
  ],
  // 국제기관
  international: [
    'who.int',         // WHO
    'imf.org',         // IMF
    'worldbank.org',   // 세계은행
    'oecd.org',        // OECD
    'un.org',          // UN
  ],
};

// 검증된 정보 타입
interface VerifiedFact {
  claim: string;           // 주장/정보
  sources: SourceInfo[];   // 출처들
  confidence: number;      // 신뢰도 (0-100)
  verificationStatus: 'verified' | 'partially_verified' | 'unverified' | 'conflicting';
  lastChecked: string;     // 검증 시간
}

interface SourceInfo {
  url: string;
  domain: string;
  title: string;
  snippet: string;
  trustLevel: 'high' | 'medium' | 'low';
  publishDate?: string;
}

interface ResearchResult {
  topic: string;
  verifiedFacts: VerifiedFact[];
  statistics: VerifiedStatistic[];
  expertQuotes: VerifiedQuote[];
  recentNews: NewsItem[];
  conflictingInfo: ConflictingInfo[];
  overallReliability: number;
  sourcesUsed: number;
  researchTimestamp: string;
}

interface VerifiedStatistic {
  value: string;
  context: string;
  source: string;
  year: number;
  confidence: number;
}

interface VerifiedQuote {
  quote: string;
  speaker: string;
  title: string;
  source: string;
  date: string;
}

interface NewsItem {
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
}

interface ConflictingInfo {
  topic: string;
  viewA: { claim: string; sources: string[] };
  viewB: { claim: string; sources: string[] };
  recommendation: string;
}

// ============================================================
// 메인 교차검증 리서치 함수
// ============================================================

export async function conductVerifiedResearch(
  topic: string,
  options: {
    minSources?: number;
    requireGovernmentSource?: boolean;
    requireRecentData?: boolean;
    maxAgeMonths?: number;
  } = {}
): Promise<ResearchResult> {
  const {
    minSources = 10,
    requireGovernmentSource = true,
    requireRecentData = true,
    maxAgeMonths = 12,
  } = options;

  console.log(`[Research] Starting verified research for: ${topic}`);
  console.log(`[Research] Minimum sources required: ${minSources}`);

  // 1단계: 웹 검색으로 정보 수집
  const rawData = await gatherInformation(topic, minSources);

  // 2단계: 출처 신뢰도 평가
  const evaluatedSources = evaluateSourceCredibility(rawData.sources);

  // 3단계: 교차 검증
  const crossVerified = await crossVerifyFacts(rawData.facts, evaluatedSources);

  // 4단계: 통계 데이터 검증
  const verifiedStats = await verifyStatistics(rawData.statistics, topic);

  // 5. 충돌하는 정보 식별
  const conflicts = identifyConflicts(crossVerified);

  // 6단계: 최종 신뢰도 계산
  const overallReliability = calculateOverallReliability(
    crossVerified,
    evaluatedSources,
    requireGovernmentSource
  );

  return {
    topic,
    verifiedFacts: crossVerified,
    statistics: verifiedStats,
    expertQuotes: rawData.quotes,
    recentNews: rawData.news,
    conflictingInfo: conflicts,
    overallReliability,
    sourcesUsed: evaluatedSources.length,
    researchTimestamp: new Date().toISOString(),
  };
}

// ============================================================
// 정보 수집 (Gemini Search Grounding 활용)
// ============================================================

async function gatherInformation(topic: string, minSources: number) {
  const searchPrompt = `
당신은 팩트체커 겸 리서치 전문가입니다.
다음 주제에 대해 공신력 있는 출처에서 정보를 수집해주세요.

주제: ${topic}

## 수집 기준
1. 반드시 공신력 있는 출처만 사용:
   - 정부 기관 (go.kr, gov.kr)
   - 공식 연구기관 (kdi.re.kr, 각종 연구원)
   - 주요 언론사 (연합뉴스, 조선일보, 동아일보 등)
   - 학술 자료 (논문, 학술지)
   - 국제기구 (WHO, OECD, IMF 등)

2. 최소 ${minSources}개 이상의 서로 다른 출처 필요

3. 각 정보마다 출처 명시

4. 최신 정보 우선 (최근 1년 이내)

## 출력 형식 (JSON)
{
  "facts": [
    {
      "claim": "검증된 사실",
      "sources": ["출처1", "출처2"],
      "confidence": 90
    }
  ],
  "statistics": [
    {
      "value": "수치",
      "context": "맥락",
      "source": "출처",
      "year": 2024
    }
  ],
  "quotes": [
    {
      "quote": "인용문",
      "speaker": "화자",
      "title": "직책",
      "source": "출처",
      "date": "날짜"
    }
  ],
  "news": [
    {
      "title": "뉴스 제목",
      "source": "언론사",
      "date": "날짜",
      "summary": "요약"
    }
  ],
  "sourcesChecked": ["출처1", "출처2", ...]
}
`;

  try {
    const response = await callGeminiPremium(searchPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        facts: parsed.facts || [],
        statistics: parsed.statistics || [],
        quotes: parsed.quotes || [],
        news: parsed.news || [],
        sources: parsed.sourcesChecked || [],
      };
    }
  } catch (error) {
    console.error('[Research] Gather information error:', error);
  }

  return { facts: [], statistics: [], quotes: [], news: [], sources: [] };
}

// ============================================================
// 출처 신뢰도 평가
// ============================================================

function evaluateSourceCredibility(sources: string[]): SourceInfo[] {
  return sources.map(source => {
    let trustLevel: 'high' | 'medium' | 'low' = 'low';
    let domain = source;

    // 도메인 추출
    try {
      const url = new URL(source.startsWith('http') ? source : `https://${source}`);
      domain = url.hostname;
    } catch {
      domain = source;
    }

    // 신뢰도 평가
    const allTrustedDomains = [
      ...TRUSTED_DOMAINS.government,
      ...TRUSTED_DOMAINS.research,
      ...TRUSTED_DOMAINS.academic,
      ...TRUSTED_DOMAINS.international,
    ];

    const mediaDomains = TRUSTED_DOMAINS.media;

    if (allTrustedDomains.some(d => domain.includes(d))) {
      trustLevel = 'high';
    } else if (mediaDomains.some(d => domain.includes(d))) {
      trustLevel = 'medium';
    }

    return {
      url: source,
      domain,
      title: source,
      snippet: '',
      trustLevel,
    };
  });
}

// ============================================================
// 교차 검증
// ============================================================

async function crossVerifyFacts(
  facts: Array<{ claim: string; sources: string[]; confidence: number }>,
  sources: SourceInfo[]
): Promise<VerifiedFact[]> {
  const verifiedFacts: VerifiedFact[] = [];

  for (const fact of facts) {
    const sourceCount = fact.sources.length;
    const highTrustSources = fact.sources.filter(s =>
      sources.find(src => src.url === s && src.trustLevel === 'high')
    ).length;

    let verificationStatus: VerifiedFact['verificationStatus'];
    let confidence = fact.confidence;

    // 검증 상태 결정
    if (sourceCount >= 3 && highTrustSources >= 1) {
      verificationStatus = 'verified';
      confidence = Math.min(confidence + 10, 100);
    } else if (sourceCount >= 2) {
      verificationStatus = 'partially_verified';
    } else {
      verificationStatus = 'unverified';
      confidence = Math.max(confidence - 20, 30);
    }

    verifiedFacts.push({
      claim: fact.claim,
      sources: fact.sources.map(s => ({
        url: s,
        domain: s,
        title: s,
        snippet: '',
        trustLevel: sources.find(src => src.url === s)?.trustLevel || 'low',
      })),
      confidence,
      verificationStatus,
      lastChecked: new Date().toISOString(),
    });
  }

  return verifiedFacts;
}

// ============================================================
// 통계 검증
// ============================================================

async function verifyStatistics(
  stats: Array<{ value: string; context: string; source: string; year: number }>,
  topic: string
): Promise<VerifiedStatistic[]> {
  const currentYear = new Date().getFullYear();

  return stats.map(stat => {
    // 연도가 너무 오래된 경우 신뢰도 감소
    const ageYears = currentYear - stat.year;
    let confidence = 90;

    if (ageYears > 3) {
      confidence -= ageYears * 5;
    }

    // 정부/공식 출처인 경우 신뢰도 증가
    if (stat.source.includes('go.kr') ||
        stat.source.includes('통계청') ||
        stat.source.includes('한국은행')) {
      confidence = Math.min(confidence + 15, 100);
    }

    return {
      ...stat,
      confidence: Math.max(confidence, 40),
    };
  });
}

// ============================================================
// 충돌 정보 식별
// ============================================================

function identifyConflicts(facts: VerifiedFact[]): ConflictingInfo[] {
  const conflicts: ConflictingInfo[] = [];

  // 같은 주제에 대해 다른 주장이 있는지 확인
  // (간단한 구현 - 실제로는 더 정교한 NLP 필요)
  for (let i = 0; i < facts.length; i++) {
    for (let j = i + 1; j < facts.length; j++) {
      const factA = facts[i];
      const factB = facts[j];

      // 키워드 기반 관련성 확인
      const wordsA = factA.claim.split(' ');
      const wordsB = factB.claim.split(' ');
      const commonWords = wordsA.filter(w => wordsB.includes(w) && w.length > 2);

      // 공통 키워드가 많지만 주장이 다른 경우
      if (commonWords.length >= 3 && factA.claim !== factB.claim) {
        // 숫자가 다른지 확인
        const numbersA = factA.claim.match(/\d+/g) || [];
        const numbersB = factB.claim.match(/\d+/g) || [];

        if (numbersA.length > 0 && numbersB.length > 0 &&
            numbersA[0] !== numbersB[0]) {
          conflicts.push({
            topic: commonWords.join(' '),
            viewA: { claim: factA.claim, sources: factA.sources.map(s => s.url) },
            viewB: { claim: factB.claim, sources: factB.sources.map(s => s.url) },
            recommendation: '가장 최근/공신력 높은 출처의 데이터 사용 권장',
          });
        }
      }
    }
  }

  return conflicts;
}

// ============================================================
// 전체 신뢰도 계산
// ============================================================

function calculateOverallReliability(
  facts: VerifiedFact[],
  sources: SourceInfo[],
  requireGovernmentSource: boolean
): number {
  if (facts.length === 0) return 0;

  let score = 0;

  // 1. 검증된 팩트 비율 (40점)
  const verifiedRatio = facts.filter(f => f.verificationStatus === 'verified').length / facts.length;
  score += verifiedRatio * 40;

  // 2. 고신뢰 출처 비율 (30점)
  const highTrustRatio = sources.filter(s => s.trustLevel === 'high').length / Math.max(sources.length, 1);
  score += highTrustRatio * 30;

  // 3. 출처 다양성 (20점)
  const uniqueDomains = new Set(sources.map(s => s.domain)).size;
  const diversityScore = Math.min(uniqueDomains / 10, 1) * 20;
  score += diversityScore;

  // 4. 정부 출처 포함 (10점)
  if (requireGovernmentSource) {
    const hasGovSource = sources.some(s =>
      TRUSTED_DOMAINS.government.some(d => s.domain.includes(d))
    );
    score += hasGovSource ? 10 : 0;
  } else {
    score += 10;
  }

  return Math.round(score);
}

// ============================================================
// 글 생성용 검증된 정보 포맷팅
// ============================================================

export function formatVerifiedDataForWriting(research: ResearchResult): string {
  let output = `
═══════════════════════════════════════════
[검증된 리서치 데이터]
신뢰도: ${research.overallReliability}% | 출처: ${research.sourcesUsed}개
═══════════════════════════════════════════

## 검증된 사실 (글에 반드시 반영)
`;

  // 검증된 사실만 포함
  const verifiedOnly = research.verifiedFacts.filter(
    f => f.verificationStatus === 'verified' || f.verificationStatus === 'partially_verified'
  );

  verifiedOnly.forEach((fact, i) => {
    output += `
${i + 1}. ${fact.claim}
   - 신뢰도: ${fact.confidence}%
   - 출처: ${fact.sources.map(s => s.domain).join(', ')}
   - 상태: ${fact.verificationStatus === 'verified' ? '✅ 완전 검증' : '⚠️ 부분 검증'}
`;
  });

  // 통계 데이터
  if (research.statistics.length > 0) {
    output += `
## 검증된 통계 (정확한 수치 사용)
`;
    research.statistics.forEach((stat, i) => {
      output += `${i + 1}. ${stat.value} (${stat.context}) - ${stat.source}, ${stat.year}년\n`;
    });
  }

  // 전문가 인용
  if (research.expertQuotes.length > 0) {
    output += `
## 전문가 인용 (신뢰도 증가용)
`;
    research.expertQuotes.forEach((quote, i) => {
      output += `${i + 1}. "${quote.quote}" - ${quote.speaker} (${quote.title})\n`;
    });
  }

  // 충돌 정보 경고
  if (research.conflictingInfo.length > 0) {
    output += `
## ⚠️ 주의: 충돌하는 정보
`;
    research.conflictingInfo.forEach((conflict, i) => {
      output += `${i + 1}. ${conflict.topic}: 출처마다 다른 수치 존재\n`;
      output += `   권장: ${conflict.recommendation}\n`;
    });
  }

  output += `
═══════════════════════════════════════════
[글 작성 규칙]
- 위 검증된 정보만 사용할 것
- 검증 안 된 정보는 "~라고 알려져 있다" 형태로 작성
- 통계는 출처와 연도 반드시 명시
- 충돌 정보는 가장 최신/공신력 높은 것 사용
═══════════════════════════════════════════
`;

  return output;
}

export type { ResearchResult, VerifiedFact, SourceInfo };
