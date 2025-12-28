'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleTooltip } from '@/components/ui/tooltip';
import type { OutlineSection } from '@/types';
import {
  GripVertical,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

// ============================================================
// Outline Editor Component
// ============================================================

export interface OutlineEditorProps {
  className?: string;
  onAIGenerate?: () => void;
  onAIRegenerate?: (sectionId: string) => void;
}

export function OutlineEditor({
  className,
  onAIGenerate,
  onAIRegenerate,
}: OutlineEditorProps) {
  const { outline, actions } = useBlogStore();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sections = outline?.structure?.sections || [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      actions.reorderSections(oldIndex, newIndex);
    }
  };

  const handleAddSection = () => {
    const newSection: OutlineSection = {
      id: `section-${Date.now()}`,
      heading: '새 섹션',
      headingLevel: 2,
      type: 'main',
      keyPoints: [],
      supportingElements: [],
      transitionTo: '',
      estimatedWords: 300,
      keywordsToInclude: [],
      order: sections.length,
    };
    actions.addSection(newSection);
    setEditingId(newSection.id);
    setEditValue(newSection.heading);
  };

  const handleEditStart = (section: OutlineSection) => {
    setEditingId(section.id);
    setEditValue(section.heading);
  };

  const handleEditSave = (sectionId: string) => {
    if (editValue.trim()) {
      actions.updateSection(sectionId, { heading: editValue.trim() });
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (sectionId: string) => {
    actions.removeSection(sectionId);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      actions.reorderSections(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < sections.length - 1) {
      actions.reorderSections(index, index + 1);
    }
  };

  const totalEstimatedLength = sections.reduce(
    (sum, s) => sum + (s.estimatedWords || 0),
    0
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            아웃라인
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            섹션을 드래그하여 순서를 변경하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {sections.length}개 섹션
          </Badge>
          <Badge variant="default">
            약 {totalEstimatedLength.toLocaleString()}자
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-4 border-b border-zinc-200 dark:border-zinc-800">
        <Button variant="outline" size="sm" onClick={handleAddSection}>
          <Plus className="h-4 w-4 mr-1" />
          섹션 추가
        </Button>
        {onAIGenerate && (
          <Button variant="primary" size="sm" onClick={onAIGenerate}>
            <Sparkles className="h-4 w-4 mr-1" />
            AI 아웃라인 생성
          </Button>
        )}
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              아직 아웃라인이 없습니다
            </p>
            <Button variant="outline" onClick={handleAddSection}>
              <Plus className="h-4 w-4 mr-1" />
              첫 섹션 추가
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    index={index}
                    isEditing={editingId === section.id}
                    editValue={editValue}
                    onEditValueChange={setEditValue}
                    onEditStart={() => handleEditStart(section)}
                    onEditSave={() => handleEditSave(section.id)}
                    onEditCancel={handleEditCancel}
                    onDelete={() => handleDelete(section.id)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onAIRegenerate={onAIRegenerate}
                    isFirst={index === 0}
                    isLast={index === sections.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

// Sortable Section Component
interface SortableSectionProps {
  section: OutlineSection;
  index: number;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAIRegenerate?: (sectionId: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableSection({
  section,
  index,
  isEditing,
  editValue,
  onEditValueChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAIRegenerate,
  isFirst,
  isLast,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 transition-all',
        isDragging && 'opacity-50 shadow-lg',
        section.headingLevel === 2 && 'border-l-4 border-l-blue-500',
        section.headingLevel === 4 && 'ml-4 border-l-2 border-l-zinc-300 dark:border-l-zinc-600'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          className="flex-shrink-0 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Section Number */}
        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {index + 1}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => onEditValueChange(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onEditSave();
                  if (e.key === 'Escape') onEditCancel();
                }}
              />
              <Button variant="ghost" size="xs" onClick={onEditSave}>
                <Check className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="xs" onClick={onEditCancel}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {section.heading}
              </p>
              {section.keyPoints && section.keyPoints.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {section.keyPoints.slice(0, 3).map((point, i) => (
                    <Badge key={i} variant="secondary" size="sm">
                      {point}
                    </Badge>
                  ))}
                  {section.keyPoints.length > 3 && (
                    <Badge variant="default" size="sm">
                      +{section.keyPoints.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                약 {(section.estimatedWords || 0).toLocaleString()}자
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1">
            <SimpleTooltip content="위로 이동">
              <Button
                variant="ghost"
                size="xs"
                onClick={onMoveUp}
                disabled={isFirst}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            </SimpleTooltip>
            <SimpleTooltip content="아래로 이동">
              <Button
                variant="ghost"
                size="xs"
                onClick={onMoveDown}
                disabled={isLast}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </SimpleTooltip>
            <SimpleTooltip content="수정">
              <Button variant="ghost" size="xs" onClick={onEditStart}>
                <Edit2 className="h-3 w-3" />
              </Button>
            </SimpleTooltip>
            {onAIRegenerate && (
              <SimpleTooltip content="AI로 다시 생성">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onAIRegenerate(section.id)}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </SimpleTooltip>
            )}
            <SimpleTooltip content="삭제">
              <Button variant="ghost" size="xs" onClick={onDelete}>
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </SimpleTooltip>
          </div>
        )}
      </div>
    </Card>
  );
}

export default OutlineEditor;
