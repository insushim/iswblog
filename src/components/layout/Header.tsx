'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useBlogStore } from '@/stores/blogStore';
import { Button } from '@/components/ui/button';
import {
  PenLine,
  TrendingUp,
  Layout,
  History,
  Settings,
  Save,
  MoreHorizontal,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';

// ============================================================
// Header Component
// ============================================================

const navigation = [
  { name: '대시보드', href: '/', icon: Layout },
  { name: '글쓰기', href: '/write', icon: PenLine },
  { name: '트렌드', href: '/trends', icon: TrendingUp },
  { name: '히스토리', href: '/history', icon: History },
  { name: '설정', href: '/settings', icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  const { project, actions } = useBlogStore();

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSave = async () => {
    try {
      await actions.saveProject();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <PenLine className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                BlogForge
              </span>
              <span className="hidden sm:inline-block text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                Pro
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Project Status */}
            {project.id && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[150px]">
                  {project.name}
                </span>
                {project.isDirty && (
                  <span className="h-2 w-2 rounded-full bg-yellow-500" title="저장되지 않은 변경사항" />
                )}
              </div>
            )}

            {/* Save Button */}
            {project.isDirty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="hidden md:inline-flex"
              >
                <Save className="h-4 w-4 mr-1" />
                저장
              </Button>
            )}

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label={darkMode ? '라이트 모드' : '다크 모드'}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* New Blog Button */}
            <Link href="/write">
              <Button variant="primary" size="sm" className="hidden sm:inline-flex">
                <PenLine className="h-4 w-4 mr-1" />
                새 글 쓰기
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="메뉴"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800">
                <Link href="/write" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    <PenLine className="h-4 w-4 mr-2" />
                    새 글 쓰기
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
