'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { FloatingMenu } from '@tiptap/extension-floating-menu';
import CharacterCount from '@tiptap/extension-character-count';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { cn } from '@/lib/utils';
import { SimpleTooltip } from '@/components/ui/tooltip';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Minus,
  Sparkles,
  Wand2,
} from 'lucide-react';

// ============================================================
// Tiptap Editor Component
// ============================================================

export interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  showToolbar?: boolean;
  showBubbleMenu?: boolean;
  showFloatingMenu?: boolean;
  onAIAction?: (action: string, selectedText?: string) => void;
}

export function TiptapEditor({
  content = '',
  onChange,
  placeholder = '여기에 글을 작성하세요...',
  className,
  editable = true,
  showToolbar = true,
  showBubbleMenu = true,
  onAIAction,
}: TiptapEditorProps) {
  const bubbleMenuRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CharacterCount,
      BubbleMenu.configure({
        element: bubbleMenuRef.current,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-zinc dark:prose-invert max-w-none',
          'prose-headings:font-bold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100',
          'prose-p:text-zinc-700 dark:prose-p:text-zinc-300',
          'prose-a:text-blue-600 dark:prose-a:text-blue-400',
          'prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100',
          'prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded',
          'focus:outline-none min-h-[300px] p-4'
        ),
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const characterCount = editor?.storage.characterCount?.characters() || 0;
  const wordCount = editor?.storage.characterCount?.words() || 0;

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          {/* Text Formatting */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              tooltip="굵게 (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              tooltip="기울임 (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              tooltip="밑줄 (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              tooltip="취소선"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              active={editor.isActive('highlight')}
              tooltip="형광펜"
            >
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              tooltip="제목 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              tooltip="제목 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              tooltip="제목 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              tooltip="글머리 기호"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              tooltip="번호 매기기"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              active={editor.isActive('taskList')}
              tooltip="체크리스트"
            >
              <CheckSquare className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Blocks */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              tooltip="인용구"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
              tooltip="코드 블록"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              tooltip="구분선"
            >
              <Minus className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              active={editor.isActive({ textAlign: 'left' })}
              tooltip="왼쪽 정렬"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              active={editor.isActive({ textAlign: 'center' })}
              tooltip="가운데 정렬"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              active={editor.isActive({ textAlign: 'right' })}
              tooltip="오른쪽 정렬"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarDivider />

          {/* Media */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => {
                const url = window.prompt('링크 URL:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              active={editor.isActive('link')}
              tooltip="링크 추가"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const url = window.prompt('이미지 URL:');
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run();
                }
              }}
              tooltip="이미지 추가"
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <div className="flex-1" />

          {/* History */}
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              tooltip="실행 취소 (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              tooltip="다시 실행 (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarGroup>

          {/* AI Actions */}
          {onAIAction && (
            <>
              <ToolbarDivider />
              <ToolbarGroup>
                <ToolbarButton
                  onClick={() => onAIAction('rewrite', editor.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to,
                    ' '
                  ))}
                  tooltip="AI로 다시 쓰기"
                  variant="ai"
                >
                  <Wand2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => onAIAction('expand')}
                  tooltip="AI로 확장하기"
                  variant="ai"
                >
                  <Sparkles className="h-4 w-4" />
                </ToolbarButton>
              </ToolbarGroup>
            </>
          )}
        </div>
      )}

      {/* Bubble Menu */}
      {showBubbleMenu && editor && (
        <div
          ref={bubbleMenuRef}
          className="hidden"
        >
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              size="sm"
            >
              <Bold className="h-3 w-3" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              size="sm"
            >
              <Italic className="h-3 w-3" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              active={editor.isActive('highlight')}
              size="sm"
            >
              <Highlighter className="h-3 w-3" />
            </ToolbarButton>
            {onAIAction && (
              <>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
                <ToolbarButton
                  onClick={() => onAIAction('rewrite')}
                  size="sm"
                  variant="ai"
                >
                  <Wand2 className="h-3 w-3" />
                </ToolbarButton>
              </>
            )}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-white dark:bg-zinc-950" />

      {/* Word Count */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          {characterCount}자 · {wordCount}단어
        </span>
        <span>
          예상 읽기 시간: {Math.ceil(wordCount / 200)}분
        </span>
      </div>
    </div>
  );
}

// Toolbar Components
function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center">{children}</div>;
}

function ToolbarDivider() {
  return <div className="w-px h-6 mx-1 bg-zinc-200 dark:bg-zinc-700" />;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'ai';
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  tooltip,
  size = 'md',
  variant = 'default',
  children,
}: ToolbarButtonProps) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded transition-colors',
        size === 'sm' ? 'p-1' : 'p-1.5',
        disabled && 'opacity-50 cursor-not-allowed',
        variant === 'ai' && 'text-purple-600 dark:text-purple-400',
        active
          ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      )}
    >
      {children}
    </button>
  );

  if (tooltip) {
    return <SimpleTooltip content={tooltip}>{button}</SimpleTooltip>;
  }

  return button;
}

export default TiptapEditor;
