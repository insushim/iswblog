'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PillTabs } from '@/components/ui/tabs';
import type { Platform } from '@/types';
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Code,
  FileText,
  Download,
} from 'lucide-react';

// ============================================================
// Content Preview Component
// ============================================================

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type ViewMode = 'preview' | 'html' | 'markdown';

const platformStyles: Record<Platform, { bg: string; font: string; maxWidth: string }> = {
  naver: {
    bg: 'bg-white',
    font: 'font-["Malgun_Gothic",sans-serif]',
    maxWidth: 'max-w-[860px]',
  },
  tistory: {
    bg: 'bg-white',
    font: 'font-["Noto_Sans_KR",sans-serif]',
    maxWidth: 'max-w-[720px]',
  },
  wordpress: {
    bg: 'bg-white',
    font: 'font-["Georgia",serif]',
    maxWidth: 'max-w-[800px]',
  },
  medium: {
    bg: 'bg-white',
    font: 'font-["Charter","Georgia",serif]',
    maxWidth: 'max-w-[680px]',
  },
  brunch: {
    bg: 'bg-[#fbfbfb]',
    font: 'font-["Noto_Serif_KR",serif]',
    maxWidth: 'max-w-[700px]',
  },
  general: {
    bg: 'bg-white',
    font: 'font-sans',
    maxWidth: 'max-w-[800px]',
  },
};

const deviceWidths: Record<DeviceType, string> = {
  desktop: 'w-full',
  tablet: 'w-[768px]',
  mobile: 'w-[375px]',
};

export interface ContentPreviewProps {
  className?: string;
  content?: string;
  title?: string;
  onExport?: (format: string) => void;
}

export function ContentPreview({
  className,
  content: propContent,
  title: propTitle,
  onExport,
}: ContentPreviewProps) {
  const { content: storeContent, input, meta } = useBlogStore();
  const [device, setDevice] = React.useState<DeviceType>('desktop');
  const [viewMode, setViewMode] = React.useState<ViewMode>('preview');
  const [copied, setCopied] = React.useState(false);

  const content = propContent ?? storeContent.finalContent ?? storeContent.humanizedDraft ?? storeContent.rawDraft ?? '';
  const title = propTitle ?? input.title;
  const platform = input.platform;
  const style = platformStyles[platform];

  const handleCopy = async () => {
    const textToCopy = viewMode === 'html' ? content : convertToMarkdown(content);
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const convertToMarkdown = (html: string): string => {
    // Simple HTML to Markdown conversion
    let md = html;
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<ul[^>]*>(.*?)<\/ul>/gis, '$1\n');
    md = md.replace(/<ol[^>]*>(.*?)<\/ol>/gis, '$1\n');
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n\n');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<[^>]+>/g, '');
    md = md.replace(/\n{3,}/g, '\n\n');
    return md.trim();
  };

  const wordCount = content.replace(/<[^>]+>/g, '').length;
  const readingTime = Math.ceil(wordCount / 500);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            미리보기
          </h3>
          <Badge variant="secondary">{platform}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {wordCount.toLocaleString()}자 · {readingTime}분
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        {/* Device Selector */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setDevice('desktop')}
            className={cn(
              'p-2 rounded transition-colors',
              device === 'desktop'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={cn(
              'p-2 rounded transition-colors',
              device === 'tablet'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={cn(
              'p-2 rounded transition-colors',
              device === 'mobile'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        {/* View Mode */}
        <PillTabs
          tabs={[
            { id: 'preview', label: '미리보기', icon: <Eye className="h-3 w-3" /> },
            { id: 'html', label: 'HTML', icon: <Code className="h-3 w-3" /> },
            { id: 'markdown', label: 'Markdown', icon: <FileText className="h-3 w-3" /> },
          ]}
          activeTab={viewMode}
          onTabChange={(id) => setViewMode(id as ViewMode)}
          size="sm"
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                복사
              </>
            )}
          </Button>
          {onExport && (
            <Button variant="primary" size="sm" onClick={() => onExport(platform)}>
              <Download className="h-4 w-4 mr-1" />
              내보내기
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-4 bg-zinc-100 dark:bg-zinc-900">
        <div className="flex justify-center">
          <div
            className={cn(
              'transition-all duration-300',
              deviceWidths[device],
              device !== 'desktop' && 'shadow-2xl rounded-lg overflow-hidden'
            )}
          >
            {viewMode === 'preview' ? (
              <PreviewContent
                content={content}
                title={title}
                platform={platform}
                style={style}
              />
            ) : viewMode === 'html' ? (
              <CodeView content={content} language="html" />
            ) : (
              <CodeView content={convertToMarkdown(content)} language="markdown" />
            )}
          </div>
        </div>
      </div>

      {/* Meta Info */}
      {meta.metaDescription && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                SEO 설명
              </span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                {meta.metaDescription}
              </p>
            </div>
            {meta.hashtags.length > 0 && (
              <div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  키워드
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {meta.hashtags.map((keyword: string, i: number) => (
                    <Badge key={i} variant="default" size="sm">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Preview Content Component
interface PreviewContentProps {
  content: string;
  title: string;
  platform: Platform;
  style: { bg: string; font: string; maxWidth: string };
}

function PreviewContent({ content, title, platform, style }: PreviewContentProps) {
  return (
    <div className={cn('min-h-full', style.bg, style.font)}>
      {/* Platform Header Simulation */}
      {platform === 'naver' && (
        <div className="bg-[#00c73c] h-12 flex items-center px-4">
          <span className="text-white font-bold">NAVER 블로그</span>
        </div>
      )}
      {platform === 'tistory' && (
        <div className="bg-[#eb5600] h-12 flex items-center px-4">
          <span className="text-white font-bold">TISTORY</span>
        </div>
      )}
      {platform === 'medium' && (
        <div className="border-b border-zinc-200 h-14 flex items-center px-6">
          <span className="text-2xl font-serif font-bold">Medium</span>
        </div>
      )}
      {platform === 'brunch' && (
        <div className="border-b border-zinc-200 h-12 flex items-center justify-center">
          <span className="text-lg font-serif text-zinc-600">brunch</span>
        </div>
      )}

      {/* Content */}
      <div className={cn('mx-auto px-6 py-8', style.maxWidth)}>
        {title && (
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
            {title}
          </h1>
        )}
        <div
          className="prose prose-zinc dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

// Code View Component
interface CodeViewProps {
  content: string;
  language: string;
}

function CodeView({ content, language }: CodeViewProps) {
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <span className="text-xs text-zinc-400">{language}</span>
      </div>
      <pre className="p-4 overflow-auto text-sm text-zinc-300 font-mono">
        <code>{content}</code>
      </pre>
    </div>
  );
}

export default ContentPreview;
