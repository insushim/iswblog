'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SimpleTooltip } from '@/components/ui/tooltip';
import type { GeneratedImage } from '@/types';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  Check,
  X,
  Sparkles,
  Copy,
  ExternalLink,
  Grid,
  LayoutList,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// ============================================================
// Image Gallery Component
// ============================================================

type ViewMode = 'grid' | 'list';

export interface ImageGalleryProps {
  className?: string;
  onGenerate?: () => void;
  onRegenerate?: (imageId: string) => void;
}

export function ImageGallery({
  className,
  onGenerate,
  onRegenerate,
}: ImageGalleryProps) {
  const { images, workflow, actions } = useBlogStore();
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [selectedImages, setSelectedImages] = React.useState<Set<string>>(new Set());

  const toggleSelect = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const selectAll = () => {
    setSelectedImages(new Set(images.inlineImages.map((img) => img.id)));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const deleteSelected = () => {
    selectedImages.forEach((id) => {
      actions.removeImage(id);
    });
    setSelectedImages(new Set());
  };

  const downloadImage = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
  };

  const isGenerating = workflow.currentStep === 4 && workflow.isGenerating;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            이미지 갤러리
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            AI로 생성된 블로그 이미지
          </p>
        </div>
        <Badge variant="secondary">
          {images.inlineImages.length}개 이미지
        </Badge>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          {onGenerate && (
            <Button
              variant="primary"
              size="sm"
              onClick={onGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  이미지 생성
                </>
              )}
            </Button>
          )}
          {selectedImages.size > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                선택 해제
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteSelected}>
                <Trash2 className="h-4 w-4 mr-1" />
                {selectedImages.size}개 삭제
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {images.inlineImages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={selectAll}>
              전체 선택
            </Button>
          )}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              )}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                이미지 생성 중...
              </p>
              <Progress value={workflow.progress} className="mt-2 h-1.5" />
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery */}
      <div className="flex-1 overflow-y-auto p-4">
        {images.inlineImages.length === 0 ? (
          <EmptyState onGenerate={onGenerate} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.inlineImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isSelected={selectedImages.has(image.id)}
                onSelect={() => toggleSelect(image.id)}
                onDownload={() => downloadImage(image)}
                onCopyUrl={() => copyUrl(image.url)}
                onRegenerate={onRegenerate ? () => onRegenerate(image.id) : undefined}
                onDelete={() => actions.removeImage(image.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {images.inlineImages.map((image) => (
              <ImageListItem
                key={image.id}
                image={image}
                isSelected={selectedImages.has(image.id)}
                onSelect={() => toggleSelect(image.id)}
                onDownload={() => downloadImage(image)}
                onCopyUrl={() => copyUrl(image.url)}
                onRegenerate={onRegenerate ? () => onRegenerate(image.id) : undefined}
                onDelete={() => actions.removeImage(image.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ onGenerate }: { onGenerate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <ImageIcon className="h-8 w-8 text-zinc-400" />
      </div>
      <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
        이미지가 없습니다
      </h4>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs">
        AI가 블로그 콘텐츠에 맞는 이미지를 자동으로 생성합니다
      </p>
      {onGenerate && (
        <Button variant="primary" onClick={onGenerate}>
          <Sparkles className="h-4 w-4 mr-2" />
          이미지 생성 시작
        </Button>
      )}
    </div>
  );
}

// Image Card (Grid View)
interface ImageCardProps {
  image: GeneratedImage;
  isSelected: boolean;
  onSelect: () => void;
  onDownload: () => void;
  onCopyUrl: () => void;
  onRegenerate?: () => void;
  onDelete: () => void;
}

function ImageCard({
  image,
  isSelected,
  onSelect,
  onDownload,
  onCopyUrl,
  onRegenerate,
  onDelete,
}: ImageCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden group cursor-pointer transition-all',
        isSelected && 'ring-2 ring-blue-500'
      )}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800">
        <img
          src={image.url}
          alt={image.altText}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Selection Indicator */}
        <div
          className={cn(
            'absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
            isSelected
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-white bg-black/20 opacity-0 group-hover:opacity-100'
          )}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <SimpleTooltip content="다운로드">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip content="URL 복사">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onCopyUrl();
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
          {onRegenerate && (
            <SimpleTooltip content="다시 생성">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate();
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </SimpleTooltip>
          )}
          <SimpleTooltip content="삭제">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-500/50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
        </div>

        {/* Caption Badge */}
        {image.caption && (
          <Badge
            variant="secondary"
            size="sm"
            className="absolute bottom-2 right-2"
          >
            {image.caption}
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
          {image.altText}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {image.style}
        </p>
      </div>
    </Card>
  );
}

// Image List Item (List View)
function ImageListItem({
  image,
  isSelected,
  onSelect,
  onDownload,
  onCopyUrl,
  onRegenerate,
  onDelete,
}: ImageCardProps) {
  return (
    <Card
      className={cn(
        'p-3 cursor-pointer transition-all',
        isSelected && 'ring-2 ring-blue-500'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        {/* Selection Checkbox */}
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-1',
            isSelected
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-zinc-300 dark:border-zinc-600'
          )}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </div>

        {/* Thumbnail */}
        <div className="flex-shrink-0 w-24 h-16 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={image.url}
            alt={image.altText}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {image.altText}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" size="sm">
              {image.style}
            </Badge>
            {image.caption && (
              <Badge variant="default" size="sm">
                {image.caption}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <SimpleTooltip content="다운로드">
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip content="URL 복사">
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onCopyUrl();
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </SimpleTooltip>
          {onRegenerate && (
            <SimpleTooltip content="다시 생성">
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate();
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </SimpleTooltip>
          )}
          <SimpleTooltip content="삭제">
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </SimpleTooltip>
        </div>
      </div>
    </Card>
  );
}

export default ImageGallery;
