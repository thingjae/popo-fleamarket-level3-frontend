'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card, Loading } from './ui';
import { type Role, useSession } from '@/lib/session';

/**
 * 화면에서 역할을 한 번 더 확인한다. (진짜로 막는 건 서버: 권한 없는 요청은 서버가 거절한다)
 */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { ready, session } = useSession();
  if (!ready) return <Loading />;
  if (!session) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="font-semibold">로그인이 필요해요.</p>
        <Link href="/login" className="mt-3 inline-block text-orange-700 underline">
          로그인하러 가기
        </Link>
      </Card>
    );
  }
  if (session.user.role !== role) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="font-semibold">{role === 'ADMIN' ? '관리자만 볼 수 있는 화면이에요.' : '셀러만 볼 수 있는 화면이에요.'}</p>
        <Link href="/" className="mt-3 inline-block text-orange-700 underline">
          마켓 목록으로
        </Link>
      </Card>
    );
  }
  return <>{children}</>;
}
