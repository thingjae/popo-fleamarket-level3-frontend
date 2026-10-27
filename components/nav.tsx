'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { saveSession, useSession } from '@/lib/session';

function Item({ href, label, current }: { href: string; label: string; current: string }) {
  const on = href === '/' ? current === '/' || current.startsWith('/markets') : current.startsWith(href);
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 font-medium ${on ? 'bg-orange-600 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
    >
      {label}
    </Link>
  );
}

/** 역할에 따라 메뉴가 달라진다: 누구나 / 셀러 / 관리자 (주소를 읽으므로 Suspense 안에서 쓴다) */
export function Nav() {
  const current = usePathname() ?? '';
  const router = useRouter();
  const { ready, session } = useSession();
  const role = session?.user.role;

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
      <Item href="/" label="마켓 둘러보기" current={current} />
      {role === 'SELLER' && <Item href="/my" label="내 신청" current={current} />}
      {role === 'ADMIN' && <Item href="/admin" label="관리자" current={current} />}
      {ready &&
        (session ? (
          <span className="ml-1 flex items-center gap-2 pl-2 text-stone-500">
            <span className="hidden sm:inline">
              {session.user.name}
              <span className="ml-1 text-xs text-stone-400">{role === 'ADMIN' ? '관리자' : '셀러'}</span>
            </span>
            <button
              type="button"
              className="rounded-lg px-2 py-1.5 text-stone-500 hover:bg-stone-100"
              onClick={() => {
                saveSession(null);
                router.push('/');
              }}
            >
              로그아웃
            </button>
          </span>
        ) : (
          <>
            <Item href="/login" label="로그인" current={current} />
            <Link href="/signup" className="rounded-lg border border-orange-600 px-3 py-1.5 font-medium text-orange-700 hover:bg-orange-50">
              셀러 가입
            </Link>
          </>
        ))}
    </nav>
  );
}

export function StaticNav() {
  return (
    <nav className="flex gap-1 text-sm">
      <Link href="/" className="rounded-lg px-3 py-1.5 font-medium text-stone-600">
        마켓 둘러보기
      </Link>
    </nav>
  );
}
