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

export function ExportPanel({ className, onExport }: ExportPanelProps) {
  const { content, input, meta, analysis } = useBlogStore();
  const [selectedFormat, setSelectedFormat] = React.useState<LocalExportFormat>('html');
  const [copied, setCopied] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportOptions, setExportOptions] = React.useState({
    includeImages: true,
    includeMeta: true,
    includeSeoTags: true,
    platformOptimized: true,
  });

  const platform = input.platform;
  const platformData = platformInfo[platform];
  const finalContent = content.finalContent || content.humanizedDraft || content.rawDraft || '';

  const handleCopy = async () => {
    const exportContent = generateExportContent(selectedFormat);
    await navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (onExport) {
        await onExport(platform, selectedFormat);
      } else {
        // Default export behavior - download file
        const exportContent = generateExportContent(selectedFormat);
        downloadFile(exportContent, selectedFormat);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const generateExportContent = (format: LocalExportFormat): string => {
    switch (format) {
      case 'html':
        return generateHtml();
      case 'markdown':
        return generateMarkdown();
      case 'text':
        return generatePlainText();
      case 'json':
        return generateJson();
      default:
        return finalContent;
    }
  };

  const generateHtml = (): string => {
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
      html += `</head>\n<body>\n`;
    }

    html += `<article>\n`;
    html += `  <h1>${input.title}</h1>\n`;
    html += finalContent;
    html += `\n</article>\n`;

    if (exportOptions.includeSeoTags) {
      html += `</body>\n</html>`;
    }

    return html;
  };

  const generateMarkdown = (): string => {
    let md = `# ${input.title}\n\n`;

    // Convert HTML to Markdown (simplified)
    let content = finalContent;
    content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    content = content.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    content = content.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    content = content.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    content = content.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    content = content.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n');
    content = content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    content = content.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<[^>]+>/g, '');
    content = content.replace(/\n{3,}/g, '\n\n');

    md += content.trim();

    if (exportOptions.includeMeta && meta.hashtags && meta.hashtags.length > 0) {
      md += `\n\n---\n\n**키워드:** ${meta.hashtags.join(', ')}`;
    }

    return md;
  };

  const generatePlainText = (): string => {
    let text = `${input.title}\n${'='.repeat(input.title.length)}\n\n`;

    let content = finalContent;
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
            disabled={!finalContent}
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
                내보내는 중...
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
