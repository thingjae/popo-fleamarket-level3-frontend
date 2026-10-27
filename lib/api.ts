import { getToken, saveSession } from './session';

// 백엔드(NestJS)에 요청을 보내는 곳. 주소는 NEXT_PUBLIC_API_URL 설정값에서 온다.
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4100').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public messages: string[] = [message],
  ) {
    super(message);
  }
}

// Render 무료 서버가 잠에서 깨는 동안 "서버를 깨우는 중" 안내를 띄운다. (components/wake-banner.tsx)
let pending = 0;
function setSlow(on: boolean) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('api-slow', { detail: on }));
}

export async function api<T>(path: string, init?: { method?: string; body?: unknown; form?: FormData }): Promise<T> {
  pending++;
  const timer = setTimeout(() => setSlow(true), 3000);
  try {
    const headers: Record<string, string> = {};
    const token = typeof window !== 'undefined' ? getToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    if (init?.body !== undefined) headers['Content-Type'] = 'application/json';

    let res: Response;
    try {
      res = await fetch(API_BASE + path, {
        method: init?.method ?? 'GET',
        headers,
        body: init?.form ?? (init?.body !== undefined ? JSON.stringify(init.body) : undefined),
        cache: 'no-store',
      });
    } catch {
      throw new ApiError(0, 'NETWORK', '서버에 연결할 수 없어요. 잠시 뒤 다시 시도해 주세요.');
    }
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      // 출입증이 만료됐으면 로그아웃 처리
      if (res.status === 401 && data?.code === 'R9' && token) saveSession(null);
      const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
      throw new ApiError(
        res.status,
        data?.code ?? 'ERROR',
        message ?? '요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.',
        data?.messages,
      );
    }
    return data as T;
  } finally {
    clearTimeout(timer);
    if (--pending === 0) setSlow(false);
  }
}

export const photoUrl = (id: number) => `${API_BASE}/photos/${id}`;
