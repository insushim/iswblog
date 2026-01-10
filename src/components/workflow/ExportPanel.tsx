'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleSelect } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Platform, ExportFormat } from '@/types';
import {
  Download,
  Copy,
  Check,
  FileText,
  Code,
  FileJson,
  Globe,
  ExternalLink,
  Settings,
  Loader2,
  Share2,
} from 'lucide-react';

// ============================================================
// Export Panel Component
// ============================================================

const platformInfo: Record<Platform, { name: string; color: string; icon: React.ReactNode }> = {
  naver: {
    name: '네이버 블로그',
    color: 'bg-green-500',
    icon: <span className="text-sm font-bold">N</span>,
  },
  tistory: {
    name: '티스토리',
    color: 'bg-orange-500',
    icon: <span className="text-sm font-bold">T</span>,
  },
  wordpress: {
    name: '워드프레스',
    color: 'bg-blue-500',
    icon: <span className="text-sm font-bold">W</span>,
  },
  medium: {
    name: 'Medium',
    color: 'bg-zinc-900',
    icon: <span className="text-sm font-bold">M</span>,
  },
  brunch: {
    name: '브런치',
    color: 'bg-zinc-700',
    icon: <span className="text-sm font-bold">B</span>,
  },
  general: {
    name: '일반',
    color: 'bg-zinc-500',
    icon: <Globe className="h-4 w-4" />,
  },
};

type LocalExportFormat = 'html' | 'markdown' | 'text' | 'json';

const formatOptions: { value: LocalExportFormat; label: string; icon: React.ReactNode }[] = [
  { value: 'html', label: 'HTML', icon: <Code className="h-4 w-4" /> },
  { value: 'markdown', label: 'Markdown', icon: <FileText className="h-4 w-4" /> },
  { value: 'text', label: '텍스트', icon: <FileText className="h-4 w-4" /> },
  { value: 'json', label: 'JSON', icon: <FileJson className="h-4 w-4" /> },
];

export interface ExportPanelProps {
  className?: string;
  onExport?: (platform: Platform, format: LocalExportFormat) => void;
}

// [IMG: 키워드] 마커에서 키워드 추출
function extractImageMarkers(htmlContent: string): string[] {
  const markers: string[] = [];
  const regex = /\[IMG:\s*([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    markers.push(match[1].trim());
  }
  return markers;
}

// 이미지 URL을 API에서 가져오기
async function fetchImageUrls(keywords: string[]): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  await Promise.all(
    keywords.map(async (keyword, index) => {
      try {
        const searchTerms = translateKeywordsForSearch(keyword);
        const response = await fetch(
          `/api/images/search?query=${encodeURIComponent(searchTerms)}&index=${index}`
        );
        const data = await response.json();
        imageMap.set(keyword, data.url);
      } catch (error) {
        console.error('Image fetch error:', error);
        // 폴백: Lorem Picsum
        const seed = hashCode(keyword + index);
        imageMap.set(keyword, `https://picsum.photos/seed/${seed}/800/450`);
      }
    })
  );

  return imageMap;
}

// [IMG: 키워드] 마커를 실제 이미지로 변환 (동기 버전 - 이미 URL이 있을 때)
function processImageMarkersSync(
  htmlContent: string,
  includeImages: boolean,
  imageUrls: Map<string, string>
): string {
  if (!includeImages) {
    return htmlContent.replace(/\[IMG:\s*([^\]]+)\]/g, '');
  }

  let imgIndex = 0;
  const processedContent = htmlContent.replace(/\[IMG:\s*([^\]]+)\]/g, (_, keywords) => {
    const trimmedKeywords = keywords.trim();
    const imageUrl = imageUrls.get(trimmedKeywords) || `https://picsum.photos/seed/${hashCode(trimmedKeywords)}/800/450`;

    // 이미지 번호에 따라 좌/우 번갈아 배치
    const isLeft = imgIndex % 2 === 0;
    const floatStyle = isLeft ? 'float: left; margin: 0 1.5rem 1rem 0;' : 'float: right; margin: 0 0 1rem 1.5rem;';
    imgIndex++;

    return `
<figure style="${floatStyle} max-width: 45%; shape-outside: margin-box;">
  <img src="${imageUrl}" alt="${trimmedKeywords}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" loading="lazy" />
  <figcaption style="margin-top: 0.5rem; font-size: 0.8rem; color: #888; text-align: center; font-style: italic;">${trimmedKeywords}</figcaption>
</figure>`;
  });

  return processedContent;
}

// 문자열을 숫자 해시로 변환 (일관된 이미지 생성용)
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 한글 키워드를 영어로 변환 (기본적인 매핑)
function translateKeywordsForSearch(keywords: string): string {
  const translations: Record<string, string> = {
    // 시니어/건강 관련
    '시니어': 'senior elderly',
    '액티브': 'active healthy',
    '라이프스타일': 'lifestyle',
    '실버': 'silver senior',
    '케어': 'care wellness',
    '케어푸드': 'healthy food elderly',
    '스마트 홈': 'smart home technology',
    '스마트홈': 'smart home technology',
    '간병': 'nursing care',
    '노후': 'retirement elderly',
    '복지': 'welfare senior',
    '어르신': 'elderly senior',
    '건강': 'health wellness',
    '식단': 'healthy food diet',
    '운동': 'exercise fitness',
    '홈트레이닝': 'home workout fitness',
    '요가': 'yoga wellness',
    '산책': 'walking nature',
    '웰빙': 'wellbeing healthy',

    // 기기/테크 관련
    '스마트폰': 'smartphone mobile',
    '테크': 'technology gadget',
    '기기': 'device gadget',
    '디지털': 'digital technology',
    '앱': 'app mobile',
    '웨어러블': 'wearable smartwatch',

    // 여행/여가 관련
    '여행': 'travel vacation',
    '관광': 'tourism travel',
    '취미': 'hobby lifestyle',
    '레저': 'leisure activity',
    '문화': 'culture art',
    '교육': 'education learning',
    '배움': 'learning study',

    // 금융/경제 관련
    '돈': 'money finance',
    '투자': 'investment stock',
    '자산': 'asset wealth',
    '연금': 'pension retirement',
    '금융': 'finance banking',
    '부업': 'side job business',
    '재테크': 'investment finance',

    // 음식 관련
    '요리': 'cooking food',
    '커피': 'coffee cafe',
    '다이어트': 'diet fitness',
    '맛집': 'restaurant food',
    '카페': 'cafe coffee shop',
    '음식': 'food cuisine',
    '식품': 'food product',

    // 생활 관련
    '인테리어': 'interior design',
    '패션': 'fashion style',
    '뷰티': 'beauty makeup',
    '육아': 'parenting baby',
    '반려동물': 'pet dog cat',
    '자동차': 'car automobile',
    '주거': 'housing home',
    '가전': 'home appliance',

    // 엔터테인먼트 관련
    '게임': 'gaming',
    '음악': 'music',
    '영화': 'movie cinema',
    '독서': 'reading books',
    '예술': 'art creative',
  };

  let result = keywords;
  for (const [korean, english] of Object.entries(translations)) {
    if (keywords.includes(korean)) {
      result = result.replace(korean, english);
    }
  }

  // 한글이 남아있으면 기본 영어 키워드 추가
  if (/[가-힣]/.test(result)) {
    result = result.replace(/[가-힣]+/g, '').trim() + ' lifestyle blog';
  }

  return result.trim() || 'lifestyle blog';
}

export function ExportPanel({ className, onExport }: ExportPanelProps) {
  const { content, input, meta, analysis } = useBlogStore();
  const [selectedFormat, setSelectedFormat] = React.useState<LocalExportFormat>('html');
  const [copied, setCopied] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportStatus, setExportStatus] = React.useState<string>('');
  const [exportOptions, setExportOptions] = React.useState({
    includeImages: true,
    includeMeta: true,
    includeSeoTags: true,
    platformOptimized: true,
  });

  const platform = input.platform;
  const platformData = platformInfo[platform];
  const finalContent = content.finalContent || content.humanizedDraft || content.rawDraft || '';

  // 이미지 URL 가져오기 (비동기)
  const fetchImagesAndGenerate = async (format: LocalExportFormat): Promise<string> => {
    let imageUrls = new Map<string, string>();

    if (exportOptions.includeImages) {
      setExportStatus('이미지 검색 중...');
      const keywords = extractImageMarkers(finalContent);
      if (keywords.length > 0) {
        imageUrls = await fetchImageUrls(keywords);
      }
    }

    setExportStatus('콘텐츠 생성 중...');
    return generateExportContent(format, imageUrls);
  };

  const handleCopy = async () => {
    setIsExporting(true);
    try {
      const exportContent = await fetchImagesAndGenerate(selectedFormat);
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setIsExporting(false);
      setExportStatus('');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (onExport) {
        await onExport(platform, selectedFormat);
      } else {
        // Default export behavior - download file
        const exportContent = await fetchImagesAndGenerate(selectedFormat);
        downloadFile(exportContent, selectedFormat);
      }
    } finally {
      setIsExporting(false);
      setExportStatus('');
    }
  };

  const generateExportContent = (format: LocalExportFormat, imageUrls: Map<string, string>): string => {
    switch (format) {
      case 'html':
        return generateHtml(imageUrls);
      case 'markdown':
        return generateMarkdown(imageUrls);
      case 'text':
        return generatePlainText();
      case 'json':
        return generateJson();
      default:
        return finalContent;
    }
  };

  const generateHtml = (imageUrls: Map<string, string>): string => {
    let html = '';

    if (exportOptions.includeSeoTags) {
      html += `<!DOCTYPE html>\n<html lang="ko">\n<head>\n`;
      html += `  <meta charset="UTF-8">\n`;
      html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
      html += `  <title>${input.title}</title>\n`;
      if (meta.metaDescription) {
        html += `  <meta name="description" content="${meta.metaDescription}">\n`;
      }
      if (meta.hashtags && meta.hashtags.length > 0) {
        html += `  <meta name="keywords" content="${meta.hashtags.join(', ')}">\n`;
      }
      // 블로그 스타일 CSS 추가
      html += `  <style>
    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.8;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #fafafa;
    }
    article {
      background: #fff;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.08);
    }
    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 1.5rem;
      line-height: 1.4;
    }
    h2 {
      font-size: 1.4rem;
      font-weight: 600;
      color: #2a2a2a;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      clear: both;
    }
    p {
      margin-bottom: 1.2rem;
      text-align: justify;
    }
    strong {
      color: #1a73e8;
      font-weight: 600;
    }
    figure {
      margin: 1rem 0;
    }
    @media (max-width: 768px) {
      body { padding: 1rem; }
      article { padding: 1.5rem; }
      figure {
        float: none !important;
        max-width: 100% !important;
        margin: 1.5rem 0 !important;
      }
    }
  </style>\n`;
      html += `</head>\n<body>\n`;
    }

    // [IMG: 키워드] 마커를 실제 이미지로 변환 (Pexels API 사용)
    const processedContent = processImageMarkersSync(finalContent, exportOptions.includeImages, imageUrls);

    html += `<article>\n`;
    html += `  <h1>${input.title}</h1>\n`;
    html += processedContent;
    html += `\n  <div style="clear: both;"></div>\n`;
    html += `</article>\n`;

    if (exportOptions.includeSeoTags) {
      html += `</body>\n</html>`;
    }

    return html;
  };

  const generateMarkdown = (imageUrls: Map<string, string>): string => {
    let md = `# ${input.title}\n\n`;

    // Convert HTML to Markdown (simplified)
    let markdownContent = finalContent;

    // [IMG: 키워드] 마커를 Markdown 이미지로 변환
    if (exportOptions.includeImages) {
      markdownContent = markdownContent.replace(/\[IMG:\s*([^\]]+)\]/g, (_, keywords) => {
        const trimmedKeywords = keywords.trim();
        const imageUrl = imageUrls.get(trimmedKeywords) || `https://picsum.photos/seed/${hashCode(trimmedKeywords)}/800/450`;
        return `\n\n![${trimmedKeywords}](${imageUrl})\n*${trimmedKeywords}*\n\n`;
      });
    } else {
      markdownContent = markdownContent.replace(/\[IMG:\s*([^\]]+)\]/g, '');
    }

    markdownContent = markdownContent.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    markdownContent = markdownContent.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    markdownContent = markdownContent.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    markdownContent = markdownContent.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    markdownContent = markdownContent.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    markdownContent = markdownContent.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    markdownContent = markdownContent.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    markdownContent = markdownContent.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n');
    markdownContent = markdownContent.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    markdownContent = markdownContent.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');
    markdownContent = markdownContent.replace(/<br\s*\/?>/gi, '\n');
    markdownContent = markdownContent.replace(/<[^>]+>/g, '');
    markdownContent = markdownContent.replace(/\n{3,}/g, '\n\n');

    md += markdownContent.trim();

    if (exportOptions.includeMeta && meta.hashtags && meta.hashtags.length > 0) {
      md += `\n\n---\n\n**키워드:** ${meta.hashtags.join(', ')}`;
    }

    return md;
  };

  const generatePlainText = (): string => {
    let text = `${input.title}\n${'='.repeat(input.title.length)}\n\n`;

    let content = finalContent;

    // 이미지 마커 처리 (PlainText에서는 설명만 남김)
    if (exportOptions.includeImages) {
      content = content.replace(/\[IMG:\s*([^\]]+)\]/g, '\n[이미지: $1]\n');
    } else {
      content = content.replace(/\[IMG:\s*([^\]]+)\]/g, '');
    }

    content = content.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '$1\n\n');
    content = content.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    content = content.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<[^>]+>/g, '');
    content = content.replace(/\n{3,}/g, '\n\n');

    text += content.trim();

    return text;
  };

  const generateJson = (): string => {
    const data = {
      title: input.title,
      topic: input.topic,
      platform: platform,
      content: {
        html: finalContent,
        plainText: generatePlainText(),
      },
      meta: exportOptions.includeMeta ? {
        description: meta.metaDescription,
        keywords: meta.hashtags,
        suggestedTitles: meta.suggestedTitles,
      } : undefined,
      analysis: {
        seo: analysis.seo,
        contentGrade: analysis.contentGrade,
      },
      createdAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (contentStr: string, format: LocalExportFormat) => {
    const mimeTypes: Record<LocalExportFormat, string> = {
      html: 'text/html',
      markdown: 'text/markdown',
      text: 'text/plain',
      json: 'application/json',
    };

    const extensions: Record<LocalExportFormat, string> = {
      html: 'html',
      markdown: 'md',
      text: 'txt',
      json: 'json',
    };

    const blob = new Blob([contentStr], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${input.title || 'blog-post'}.${extensions[format]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = finalContent.replace(/<[^>]+>/g, '').length;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            내보내기
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            완성된 콘텐츠를 다양한 형식으로 내보내기
          </p>
        </div>
        <Badge variant="secondary">
          {wordCount.toLocaleString()}자
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Platform Selection */}
        <Card className="p-4">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            발행 플랫폼
          </h4>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-white',
                platformData.color
              )}
            >
              {platformData.icon}
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {platformData.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                플랫폼에 최적화된 형식으로 내보냅니다
              </p>
            </div>
          </div>
        </Card>

        {/* Format Selection */}
        <Card className="p-4">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            내보내기 형식
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {formatOptions.map((format) => (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                  selectedFormat === format.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                )}
              >
                <span
                  className={cn(
                    'text-zinc-500',
                    selectedFormat === format.value && 'text-blue-600 dark:text-blue-400'
                  )}
                >
                  {format.icon}
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    selectedFormat === format.value
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-zinc-700 dark:text-zinc-300'
                  )}
                >
                  {format.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Export Options */}
        <Card className="p-4">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            내보내기 옵션
          </h4>
          <div className="space-y-4">
            <Switch
              label="이미지 포함"
              description="생성된 이미지를 함께 내보냅니다"
              checked={exportOptions.includeImages}
              onCheckedChange={(checked) =>
                setExportOptions({ ...exportOptions, includeImages: checked })
              }
            />
            <Switch
              label="메타 정보 포함"
              description="SEO 메타 태그를 포함합니다"
              checked={exportOptions.includeMeta}
              onCheckedChange={(checked) =>
                setExportOptions({ ...exportOptions, includeMeta: checked })
              }
            />
            <Switch
              label="SEO 태그 포함"
              description="HTML head 태그를 포함합니다"
              checked={exportOptions.includeSeoTags}
              onCheckedChange={(checked) =>
                setExportOptions({ ...exportOptions, includeSeoTags: checked })
              }
            />
            <Switch
              label="플랫폼 최적화"
              description="선택한 플랫폼에 맞게 형식을 조정합니다"
              checked={exportOptions.platformOptimized}
              onCheckedChange={(checked) =>
                setExportOptions({ ...exportOptions, platformOptimized: checked })
              }
            />
          </div>
        </Card>

        {/* Content Stats */}
        <Card className="p-4">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            콘텐츠 정보
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {wordCount.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">글자 수</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {Math.ceil(wordCount / 500)}분
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">예상 읽기 시간</p>
            </div>
            {analysis.contentGrade && (
              <>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.contentGrade.overall}점
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">품질 점수</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.seo?.overallScore || 0}점
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">SEO 점수</p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        {/* Export Status */}
        {isExporting && exportStatus && (
          <div className="text-sm text-center text-blue-600 dark:text-blue-400">
            {exportStatus}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
            disabled={!finalContent || isExporting}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                클립보드 복사
              </>
            )}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleExport}
            disabled={!finalContent || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {exportStatus || '내보내는 중...'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </>
            )}
          </Button>
        </div>

        {platform !== 'general' && (
          <Button
            variant="ghost"
            fullWidth
            onClick={() => window.open(getPlatformUrl(platform), '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {platformData.name}에서 글쓰기
          </Button>
        )}
      </div>
    </div>
  );
}

function getPlatformUrl(platform: Platform): string {
  const urls: Record<Platform, string> = {
    naver: 'https://blog.naver.com/PostWriteForm.naver',
    tistory: 'https://www.tistory.com/auth/login',
    wordpress: 'https://wordpress.com/post',
    medium: 'https://medium.com/new-story',
    brunch: 'https://brunch.co.kr/write',
    general: '#',
  };
  return urls[platform];
}

export default ExportPanel;
