'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { btnPrimary, Card, ErrorBox, Field, inputClass } from '@/components/ui';
import { api } from '@/lib/api';
import { type Session, saveSession } from '@/lib/session';

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const s = await api<Session>('/auth/login', { method: 'POST', body: { email, password } });
      saveSession(s);
      // 다른 사이트로 보내지 않도록 우리 사이트 안의 주소만 따라간다
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      router.push(safeNext ?? (s.user.role === 'ADMIN' ? '/admin' : '/my'));
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="이메일">
          <input className={inputClass} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="popo@example.com" />
        </Field>
        <Field label="비밀번호">
          <input className={inputClass} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <ErrorBox error={error} />
        <button className={`${btnPrimary} w-full`} disabled={busy}>
          {busy ? '로그인하는 중…' : '로그인'}
        </button>
        <p className="text-center text-sm text-stone-500">
          처음이신가요?{' '}
          <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-orange-700 underline">
            셀러 가입하기
          </Link>
        </p>
      </form>
    </Card>
  );
}
