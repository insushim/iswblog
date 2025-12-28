'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/input';
import { useBlogStore } from '@/stores/blogStore';
import {
  FileText,
  Clock,
  Trash2,
  Search,
  ChevronRight,
  FolderOpen,
  Plus,
  Wand2,
} from 'lucide-react';

// ============================================================
// History Page
// ============================================================

interface SavedProject {
  id: string;
  title: string;
  topic: string;
  platform: string;
  createdAt: string;
  wordCount?: number;
}

export default function HistoryPage() {
  const { project } = useBlogStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [savedProjects, setSavedProjects] = React.useState<SavedProject[]>([]);

  React.useEffect(() => {
    // Load saved projects from localStorage
    const saved = localStorage.getItem('blogforge-projects');
    if (saved) {
      try {
        setSavedProjects(JSON.parse(saved));
      } catch {
        // Ignore parse error
      }
    }
  }, []);

  const filteredProjects = React.useMemo(() => {
    if (!searchQuery.trim()) return savedProjects;
    const query = searchQuery.toLowerCase();
    return savedProjects.filter(
      (item: SavedProject) =>
        item.title.toLowerCase().includes(query) ||
        item.topic.toLowerCase().includes(query)
    );
  }, [savedProjects, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('이 기록을 삭제하시겠습니까?')) {
      const updated = savedProjects.filter((p: SavedProject) => p.id !== id);
      setSavedProjects(updated);
      localStorage.setItem('blogforge-projects', JSON.stringify(updated));
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              작성 기록
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              이전에 작성한 블로그 글을 확인하세요
            </p>
          </div>
          <Link href="/write">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              새 글 작성
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            placeholder="제목 또는 주제로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* History List */}
        {filteredProjects.length === 0 ? (
          <EmptyState hasSearch={!!searchQuery} />
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((item: SavedProject, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-zinc-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {item.topic}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" size="sm">
                            {item.platform}
                          </Badge>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(item.createdAt)}
                          </span>
                          {item.wordCount && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {item.wordCount.toLocaleString()}자
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <Link href={`/write?restore=${item.id}`}>
                        <Button variant="outline" size="sm">
                          열기
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          {hasSearch ? (
            <Search className="h-8 w-8 text-zinc-400" />
          ) : (
            <FolderOpen className="h-8 w-8 text-zinc-400" />
          )}
        </div>
        <h3 className="font-medium text-zinc-900 dark:text-white mb-2">
          {hasSearch ? '검색 결과가 없습니다' : '작성 기록이 없습니다'}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
          {hasSearch
            ? '다른 검색어로 시도해보세요'
            : '새로운 블로그 글을 작성하면 여기에 기록됩니다'}
        </p>
        {!hasSearch && (
          <Link href="/write">
            <Button variant="primary">
              <Wand2 className="h-4 w-4 mr-2" />
              첫 글 작성하기
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
