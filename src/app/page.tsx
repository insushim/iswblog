'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import {
  Wand2,
  Sparkles,
  TrendingUp,
  Users,
  BarChart2,
  FileText,
  Image,
  Share2,
  ChevronRight,
  Check,
  Star,
  Zap,
} from 'lucide-react';

// ============================================================
// Landing Page
// ============================================================

const features = [
  {
    icon: <Users className="h-6 w-6" />,
    title: '파워블로거 스타일 분석',
    description: '40+명의 국내외 파워블로거 스타일을 학습하여 당신만의 글쓰기 스타일을 만들어줍니다.',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: '실시간 트렌드 분석',
    description: '검색 트렌드와 인기 키워드를 분석하여 시의적절한 주제를 추천합니다.',
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    title: 'SEO 자동 최적화',
    description: '검색엔진 최적화를 자동으로 적용하여 상위 노출 가능성을 높입니다.',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: '휴머나이즈 기능',
    description: 'AI 탐지를 우회하는 자연스러운 글쓰기 스타일로 변환합니다.',
  },
  {
    icon: <Image className="h-6 w-6" />,
    title: 'AI 이미지 생성',
    description: '글 내용에 맞는 고품질 이미지를 AI가 자동으로 생성합니다.',
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: '멀티 플랫폼 발행',
    description: '네이버, 티스토리, 워드프레스 등 다양한 플랫폼에 최적화된 형식으로 내보냅니다.',
  },
];

const workflow = [
  { step: 1, title: '리서치', description: '주제 분석 및 자료 수집' },
  { step: 2, title: '아웃라인', description: '글 구조 자동 설계' },
  { step: 3, title: '초안 작성', description: 'AI가 블로그 글 생성' },
  { step: 4, title: '이미지', description: '맞춤 이미지 생성' },
  { step: 5, title: 'SEO', description: '검색 최적화 적용' },
  { step: 6, title: '휴머나이즈', description: '자연스러운 표현으로 변환' },
  { step: 7, title: '발행', description: '플랫폼별 내보내기' },
];

const testimonials = [
  {
    name: '김민수',
    role: '마케팅 블로거',
    content: '하루에 3-4개 글을 쓰던 것이 이제 10개 이상 가능해졌어요. 품질도 훨씬 좋아졌습니다.',
    rating: 5,
  },
  {
    name: '이지영',
    role: '여행 블로거',
    content: '파워블로거 스타일 분석 기능이 정말 놀라워요. 제 스타일을 그대로 살려줍니다.',
    rating: 5,
  },
  {
    name: '박준혁',
    role: '테크 리뷰어',
    content: 'SEO 최적화와 휴머나이즈 기능 덕분에 검색 유입이 3배 증가했습니다.',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-950" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="primary" className="mb-6">
                <Sparkles className="h-3 w-3 mr-1" />
                AI 기반 블로그 글쓰기의 새로운 패러다임
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6">
                파워블로거 스타일로
                <br />
                <span className="text-gradient">
                  전문적인 블로그 글쓰기
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-8">
                40+명의 국내외 파워블로거 스타일을 분석하여 SEO 최적화된
                고품질 블로그 콘텐츠를 AI로 자동 생성합니다.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/write">
                  <Button variant="primary" size="lg" animated>
                    <Wand2 className="h-5 w-5 mr-2" />
                    무료로 시작하기
                  </Button>
                </Link>
                <Link href="/trends">
                  <Button variant="outline" size="lg">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    트렌드 보기
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '40+', label: '파워블로거 스타일' },
              { value: '7단계', label: '전문 워크플로우' },
              { value: '5개', label: '지원 플랫폼' },
              { value: '99%', label: 'AI 탐지 우회율' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              강력한 기능들
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              블로그 글쓰기에 필요한 모든 기능을 AI가 자동으로 처리합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              7단계 전문 워크플로우
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              전문 블로거의 글쓰기 과정을 AI가 단계별로 자동화합니다.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {workflow.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center"
              >
                <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">
                      {item.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </div>
                {i < workflow.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-zinc-400 mx-2 hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              사용자 후기
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              블로거들이 경험한 BlogForge Pro의 효과를 확인하세요.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                    &quot;{testimonial.content}&quot;
                  </p>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {testimonial.role}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
              복잡한 설정 없이, 주제만 입력하면 바로 전문적인 블로그 글이 완성됩니다.
            </p>
            <Link href="/write">
              <Button variant="primary" size="lg" animated>
                <Zap className="h-5 w-5 mr-2" />
                무료로 글쓰기 시작
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-zinc-900 dark:text-white">
                BlogForge Pro
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              © 2024 BlogForge Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
