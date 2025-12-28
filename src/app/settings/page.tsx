'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SimpleSelect } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useBlogStore } from '@/stores/blogStore';
import { useTheme } from 'next-themes';
import type { Platform } from '@/types';
import {
  Settings,
  User,
  Palette,
  Key,
  Bell,
  Globe,
  Save,
  RotateCcw,
  Check,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';

// ============================================================
// Settings Page
// ============================================================

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { input, actions } = useBlogStore();
  const [saved, setSaved] = React.useState(false);
  const [settings, setSettings] = React.useState({
    defaultPlatform: input.platform,
    defaultTone: input.tone,
    defaultLength: input.length,
    autoSave: true,
    notifications: true,
    openaiApiKey: '',
    anthropicApiKey: '',
  });

  const handleSave = () => {
    // Apply default settings
    actions.setInput('platform', settings.defaultPlatform);
    actions.setInput('tone', settings.defaultTone);
    actions.setInput('length', settings.defaultLength);

    // Save to localStorage
    localStorage.setItem('blogforge-settings', JSON.stringify(settings));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('모든 설정을 초기화하시겠습니까?')) {
      setSettings({
        defaultPlatform: 'naver',
        defaultTone: 'professional',
        defaultLength: 'medium',
        autoSave: true,
        notifications: true,
        openaiApiKey: '',
        anthropicApiKey: '',
      });
    }
  };

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('blogforge-settings');
    if (savedSettings) {
      try {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      } catch {
        // Ignore parse error
      }
    }
  }, []);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              설정
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              앱 설정을 관리하세요
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              초기화
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  저장됨
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                외관
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
                  테마
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-4 w-4 mr-1" />
                    라이트
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    다크
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-4 w-4 mr-1" />
                    시스템
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Defaults */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                기본 설정
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
                  기본 플랫폼
                </label>
                <SimpleSelect
                  value={settings.defaultPlatform}
                  onValueChange={(value) =>
                    setSettings({ ...settings, defaultPlatform: value as Platform })
                  }
                  options={[
                    { value: 'naver', label: '네이버 블로그' },
                    { value: 'tistory', label: '티스토리' },
                    { value: 'wordpress', label: '워드프레스' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'brunch', label: '브런치' },
                    { value: 'general', label: '일반' },
                  ]}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
                  기본 톤
                </label>
                <SimpleSelect
                  value={settings.defaultTone}
                  onValueChange={(value) =>
                    setSettings({ ...settings, defaultTone: value as typeof settings.defaultTone })
                  }
                  options={[
                    { value: 'professional', label: '전문적' },
                    { value: 'casual', label: '캐주얼' },
                    { value: 'friendly', label: '친근한' },
                    { value: 'formal', label: '격식체' },
                    { value: 'humorous', label: '유머러스' },
                    { value: 'educational', label: '교육적' },
                  ]}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
                  기본 글 길이
                </label>
                <SimpleSelect
                  value={settings.defaultLength}
                  onValueChange={(value) =>
                    setSettings({ ...settings, defaultLength: value as typeof settings.defaultLength })
                  }
                  options={[
                    { value: 'short', label: '짧은 글 (800-1,500자)' },
                    { value: 'medium', label: '중간 길이 (1,500-3,000자)' },
                    { value: 'long', label: '긴 글 (3,000-5,000자)' },
                    { value: 'detailed', label: '상세 글 (5,000자 이상)' },
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                환경 설정
              </h2>
            </div>

            <div className="space-y-4">
              <Switch
                label="자동 저장"
                description="작성 중인 내용을 자동으로 저장합니다"
                checked={settings.autoSave}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoSave: checked })
                }
              />
              <Switch
                label="알림"
                description="작업 완료 및 오류 알림을 받습니다"
                checked={settings.notifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notifications: checked })
                }
              />
            </div>
          </Card>

          {/* API Keys */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                API 키
              </h2>
              <Badge variant="warning" size="sm">
                선택사항
              </Badge>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              자체 API 키를 사용하면 더 빠른 처리와 확장된 기능을 이용할 수 있습니다.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
                  OpenAI API 키
                </label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={settings.openaiApiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, openaiApiKey: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
                  Anthropic API 키
                </label>
                <Input
                  type="password"
                  placeholder="sk-ant-..."
                  value={settings.anthropicApiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, anthropicApiKey: e.target.value })
                  }
                />
              </div>
            </div>
          </Card>

          {/* About */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                정보
              </h2>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">버전</span>
                <span className="text-zinc-900 dark:text-white">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">빌드</span>
                <span className="text-zinc-900 dark:text-white">2024.01</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
