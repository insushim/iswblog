'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TopicInput } from './TopicInput';
import { StyleSettings } from './StyleSettings';
import { BloggerSelector } from './BloggerSelector';
import {
  FileText,
  Palette,
  Users,
  Wand2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// ============================================================
// Input Panel Component
// ============================================================

export interface InputPanelProps {
  className?: string;
  onGenerate?: () => void;
}

export function InputPanel({ className, onGenerate }: InputPanelProps) {
  const { input, workflow, actions } = useBlogStore();
  const [activeTab, setActiveTab] = React.useState('topic');

  const canGenerate = input.topic.trim() && input.title.trim();

  const handleGenerate = async () => {
    if (!canGenerate) return;

    if (onGenerate) {
      onGenerate();
    } else {
      await actions.startGeneration();
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          글쓰기 설정
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          주제와 스타일을 설정하고 AI 글쓰기를 시작하세요
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="px-4 pt-2 justify-start bg-transparent border-b border-zinc-200 dark:border-zinc-800 rounded-none">
          <TabsTrigger value="topic" className="gap-1.5">
            <FileText className="h-4 w-4" />
            주제
          </TabsTrigger>
          <TabsTrigger value="style" className="gap-1.5">
            <Palette className="h-4 w-4" />
            스타일
          </TabsTrigger>
          <TabsTrigger value="blogger" className="gap-1.5">
            <Users className="h-4 w-4" />
            블로거
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="topic" className="p-4 m-0">
            <TopicInput />
          </TabsContent>
          <TabsContent value="style" className="p-4 m-0">
            <StyleSettings />
          </TabsContent>
          <TabsContent value="blogger" className="p-4 m-0">
            <BloggerSelector />
          </TabsContent>
        </div>
      </Tabs>

      {/* Validation Messages */}
      {!canGenerate && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>주제와 제목을 입력해주세요.</span>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {workflow.errors.length > 0 && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          {workflow.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Generate Button */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleGenerate}
          disabled={!canGenerate || workflow.isGenerating}
          animated
        >
          {workflow.isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              생성 중... ({workflow.progress}%)
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              AI 글쓰기 시작
            </>
          )}
        </Button>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>톤: {input.tone}</span>
          <span>•</span>
          <span>길이: {input.length}</span>
          <span>•</span>
          <span>스타일: {input.selectedBloggerStyles.length}개</span>
        </div>
      </div>
    </div>
  );
}

export default InputPanel;
