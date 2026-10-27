'use client';

import { useMemo, useSyncExternalStore } from 'react';

// 로그인 정보(출입증 + 회원 정보)는 브라우저 localStorage 에 둔다.
// 프론트(vercel.app)와 백엔드(onrender.com)는 도메인이 달라서 쿠키보다 이 방식이 안정적이다.

export type Role = 'ADMIN' | 'SELLER';
export type SessionUser = { id: number; email: string; role: Role; name: string; phone: string };
export type Session = { token: string; user: SessionUser };

const KEY = 'popo_session';
const EVENT = 'popo-session';

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function saveSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function getToken(): string | null {
  try {
    return (JSON.parse(read() ?? 'null') as Session | null)?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * 지금 로그인한 사람. 서버에서 그릴 때와 첫 화면에서는 ready=false (아직 모름).
 */
export function useSession(): { ready: boolean; session: Session | null } {
  const raw = useSyncExternalStore(subscribe, read, () => undefined as unknown as string | null);
  return useMemo(() => {
    if (raw === undefined) return { ready: false, session: null };
    try {
      return { ready: true, session: raw ? (JSON.parse(raw) as Session) : null };
    } catch {
      return { ready: true, session: null };
    }
  }, [raw]);
}
