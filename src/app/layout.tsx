import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BlogForge Pro - AI 기반 블로그 글쓰기 플랫폼',
  description: '파워블로거 스타일을 분석하여 SEO 최적화된 고품질 블로그 콘텐츠를 AI로 자동 생성합니다.',
  keywords: ['블로그', 'AI 글쓰기', 'SEO', '콘텐츠 생성', '파워블로거'],
  authors: [{ name: 'BlogForge Team' }],
  openGraph: {
    title: 'BlogForge Pro - AI 기반 블로그 글쓰기 플랫폼',
    description: '파워블로거 스타일을 분석하여 SEO 최적화된 고품질 블로그 콘텐츠를 AI로 자동 생성합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
