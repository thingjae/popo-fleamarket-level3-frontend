import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Nav, StaticNav } from '@/components/nav';
import { WakeBanner } from '@/components/wake-banner';
import './globals.css';

export const metadata: Metadata = {
  title: '포포 플리마켓',
  description: '마포구 오프라인 플리마켓을 열고, 참가하고, 미리 구경하는 곳 (가상 서비스)',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900">
        <WakeBanner />
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-lg text-white">🎪</span>
              <span>
                <span className="block text-xs font-medium text-orange-700">마포 오프라인 마켓</span>
                <span className="block text-base font-bold leading-tight">포포 플리마켓</span>
              </span>
            </Link>
            <Suspense fallback={<StaticNav />}>
              <Nav />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
