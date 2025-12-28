'use client';

import React from 'react';
import { useBlogStore } from '@/stores/blogStore';
import { MainLayout, EditorLayout } from '@/components/layout';
import { InputPanel } from '@/components/input';
import { TiptapEditor, OutlineEditor, ContentPreview, ImageGallery } from '@/components/editor';
import { WorkflowStepper, ResearchPanel, DraftPanel, ExportPanel } from '@/components/workflow';
import { SEOAnalyzer, ContentGrader, TrendAnalyzer } from '@/components/analysis';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Search,
  List,
  Image,
  BarChart2,
  Sparkles,
  Share2,
  Settings,
  Eye,
  TrendingUp,
} from 'lucide-react';

// ============================================================
// Write Page
// ============================================================

export default function WritePage() {
  const { workflow, content, outline, actions } = useBlogStore();
  const [leftTab, setLeftTab] = React.useState('input');
  const [rightTab, setRightTab] = React.useState('preview');

  // API call handlers
  const handleResearch = async () => {
    actions.goToStep(1);
    actions.setGenerating(true);

    try {
      const { input } = useBlogStore.getState();
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: input.topic,
          keywords: input.keywords,
          platform: input.platform,
        }),
      });

      const data = await response.json();
      if (data.topicAnalysis || data.keywordResearch) {
        actions.setResearch(data);
        actions.completeStep(1);
      } else {
        console.error('Research API response:', data);
        actions.addError(1, data.error || '리서치 데이터를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('Research error:', error);
      actions.addError(1, '리서치 중 오류가 발생했습니다.');
    } finally {
      actions.setGenerating(false);
    }
  };

  const handleOutlineGenerate = async () => {
    actions.goToStep(2);
    actions.setGenerating(true);

    try {
      const { input } = useBlogStore.getState();
      const response = await fetch('/api/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: input.topic,
          title: input.title,
          tone: input.tone,
          length: input.length,
          keywords: input.keywords,
          platform: input.platform,
          bloggerStyles: input.selectedBloggerStyles,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('Outline API error:', data.error);
        actions.addError(2, data.error);
      } else if (data.sections || data.topic) {
        actions.setOutline(data);
        actions.completeStep(2);
      } else {
        console.error('Outline API response:', data);
        actions.addError(2, '아웃라인 데이터를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('Outline error:', error);
      actions.addError(2, '아웃라인 생성 중 오류가 발생했습니다.');
    } finally {
      actions.setGenerating(false);
    }
  };

  const handleDraftGenerate = async () => {
    actions.goToStep(3);
    actions.setGenerating(true);
    actions.setProgress(10, '초안 작성 중...');

    try {
      const state = useBlogStore.getState();
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.input.topic,
          title: state.input.title,
          outline: state.outline,
          tone: state.input.tone,
          length: state.input.length,
          platform: state.input.platform,
          bloggerStyles: state.input.selectedBloggerStyles,
          advancedOptions: state.input.advancedOptions,
          researchData: state.research,
        }),
      });

      actions.setProgress(50, '초안 생성 완료...');

      const data = await response.json();
      if (data.error) {
        console.error('Draft API error:', data.error);
        actions.addError(3, data.error);
      } else if (data.content) {
        actions.setContent({
          rawDraft: data.content,
          finalContent: data.content
        });
        actions.completeStep(3);
        actions.setProgress(100, '완료');
      } else {
        console.error('Draft API response:', data);
        actions.addError(3, '초안 데이터를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('Draft error:', error);
      actions.addError(3, '초안 생성 중 오류가 발생했습니다.');
    } finally {
      actions.setGenerating(false);
    }
  };

  const handleSEOOptimize = async () => {
    actions.goToStep(5);
    actions.setGenerating(true);

    try {
      const state = useBlogStore.getState();
      const response = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: state.content.rawDraft || state.content.finalContent,
          title: state.input.title,
          keywords: state.input.keywords,
          platform: state.input.platform,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('SEO API error:', data.error);
        actions.addError(5, data.error);
      } else if (data.optimizedContent || data.analysis || data.meta) {
        if (data.optimizedContent) {
          actions.setContent({ finalContent: data.optimizedContent });
        }
        if (data.analysis) {
          actions.setAnalysis({ seo: data.analysis });
        }
        if (data.meta) {
          actions.setMeta(data.meta);
        }
        actions.completeStep(5);
      } else {
        console.error('SEO API response:', data);
        actions.addError(5, 'SEO 분석 데이터를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('SEO error:', error);
      actions.addError(5, 'SEO 최적화 중 오류가 발생했습니다.');
    } finally {
      actions.setGenerating(false);
    }
  };

  const handleHumanize = async () => {
    actions.goToStep(6);
    actions.setGenerating(true);

    try {
      const state = useBlogStore.getState();
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: state.content.finalContent || state.content.rawDraft,
          level: state.input.advancedOptions.humanizeLevel,
          bloggerStyles: state.input.selectedBloggerStyles,
          tone: state.input.tone,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('Humanize API error:', data.error);
        actions.addError(6, data.error);
      } else if (data.humanizedContent) {
        actions.setContent({
          humanizedDraft: data.humanizedContent,
          finalContent: data.humanizedContent
        });
        actions.completeStep(6);
      } else {
        console.error('Humanize API response:', data);
        actions.addError(6, '휴머나이즈 데이터를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('Humanize error:', error);
      actions.addError(6, '휴머나이즈 중 오류가 발생했습니다.');
    } finally {
      actions.setGenerating(false);
    }
  };

  const handleImageGenerate = async () => {
    actions.goToStep(4);
    actions.setImageGenerating(true);

    try {
      const state = useBlogStore.getState();
      const sections = state.outline?.structure?.sections || [];

      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.input.topic,
          title: state.input.title,
          sections: sections.map(s => s.heading),
          style: state.input.advancedOptions.imageStyle,
          count: state.input.advancedOptions.imageCount,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('Image API error:', data.error);
        actions.addError(4, data.error);
      } else if (data.images) {
        actions.setImages({ inlineImages: data.images });
        actions.completeStep(4);
      } else {
        console.error('Image API response:', data);
        actions.addError(4, '이미지 데이터를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('Image error:', error);
      actions.addError(4, '이미지 생성 중 오류가 발생했습니다.');
    } finally {
      actions.setImageGenerating(false);
    }
  };

  const handleGrade = async () => {
    actions.goToStep(7);
    actions.setGenerating(true);

    try {
      const state = useBlogStore.getState();
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: state.content.finalContent || state.content.rawDraft,
          title: state.input.title,
          topic: state.input.topic,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error('Grade API error:', data.error);
        actions.addError(7, data.error);
      } else if (data.grade) {
        actions.setAnalysis({ contentGrade: data.grade });
        actions.completeStep(7);
      } else {
        console.error('Grade API response:', data);
        actions.addError(7, '품질 평가 데이터를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('Grade error:', error);
      actions.addError(7, '품질 평가 중 오류가 발생했습니다.');
    } finally {
      actions.setGenerating(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    actions.setFinalContent(newContent);
  };

  // Left panel content
  const renderLeftPanel = () => (
    <Tabs value={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full">
      <TabsList className="px-2 pt-2 justify-start bg-transparent border-b border-zinc-200 dark:border-zinc-800 rounded-none flex-shrink-0">
        <TabsTrigger value="input" className="gap-1.5">
          <Settings className="h-4 w-4" />
          설정
        </TabsTrigger>
        <TabsTrigger value="research" className="gap-1.5">
          <Search className="h-4 w-4" />
          리서치
        </TabsTrigger>
        <TabsTrigger value="outline" className="gap-1.5">
          <List className="h-4 w-4" />
          아웃라인
        </TabsTrigger>
        <TabsTrigger value="trends" className="gap-1.5">
          <TrendingUp className="h-4 w-4" />
          트렌드
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="input" className="h-full m-0">
          <InputPanel onGenerate={handleOutlineGenerate} />
        </TabsContent>
        <TabsContent value="research" className="h-full m-0">
          <ResearchPanel onResearch={handleResearch} />
        </TabsContent>
        <TabsContent value="outline" className="h-full m-0">
          <OutlineEditor onAIGenerate={handleOutlineGenerate} />
        </TabsContent>
        <TabsContent value="trends" className="h-full m-0">
          <TrendAnalyzer />
        </TabsContent>
      </div>
    </Tabs>
  );

  // Center panel content
  const renderCenterPanel = () => (
    <div className="flex flex-col h-full">
      {/* Workflow Status */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <WorkflowStepper orientation="horizontal" compact />
      </div>

      {/* Draft Panel or Editor */}
      <div className="flex-1 overflow-hidden">
        {content.finalContent ? (
          <TiptapEditor
            content={content.finalContent}
            onChange={handleContentChange}
            showToolbar
            showBubbleMenu
            className="h-full"
          />
        ) : (
          <DraftPanel
            onGenerateDraft={handleDraftGenerate}
            onOptimize={handleSEOOptimize}
            onHumanize={handleHumanize}
          />
        )}
      </div>
    </div>
  );

  // Right panel content
  const renderRightPanel = () => (
    <Tabs value={rightTab} onValueChange={setRightTab} className="flex flex-col h-full">
      <TabsList className="px-2 pt-2 justify-start bg-transparent border-b border-zinc-200 dark:border-zinc-800 rounded-none flex-shrink-0">
        <TabsTrigger value="preview" className="gap-1.5">
          <Eye className="h-4 w-4" />
          미리보기
        </TabsTrigger>
        <TabsTrigger value="images" className="gap-1.5">
          <Image className="h-4 w-4" />
          이미지
        </TabsTrigger>
        <TabsTrigger value="seo" className="gap-1.5">
          <BarChart2 className="h-4 w-4" />
          SEO
        </TabsTrigger>
        <TabsTrigger value="grade" className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          품질
        </TabsTrigger>
        <TabsTrigger value="export" className="gap-1.5">
          <Share2 className="h-4 w-4" />
          내보내기
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="preview" className="h-full m-0">
          <ContentPreview />
        </TabsContent>
        <TabsContent value="images" className="h-full m-0">
          <ImageGallery onGenerate={handleImageGenerate} />
        </TabsContent>
        <TabsContent value="seo" className="h-full m-0">
          <SEOAnalyzer onAnalyze={handleSEOOptimize} />
        </TabsContent>
        <TabsContent value="grade" className="h-full m-0">
          <ContentGrader onGrade={handleGrade} />
        </TabsContent>
        <TabsContent value="export" className="h-full m-0">
          <ExportPanel />
        </TabsContent>
      </div>
    </Tabs>
  );

  return (
    <MainLayout showSidebar={false}>
      <EditorLayout
        leftPanel={renderLeftPanel()}
        centerPanel={renderCenterPanel()}
        rightPanel={renderRightPanel()}
      />
    </MainLayout>
  );
}
