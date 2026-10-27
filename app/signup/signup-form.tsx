'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { btnPrimary, Card, ErrorBox, Field, inputClass } from '@/components/ui';
import { api } from '@/lib/api';
import { type Session, saveSession } from '@/lib/session';

export function SignupForm() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const s = await api<Session>('/auth/signup', { method: 'POST', body: form });
      saveSession(s);
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      router.push(safeNext ?? '/');
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="이메일 (로그인 아이디)">
          <input className={inputClass} type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="popo@example.com" />
        </Field>
        <Field label="비밀번호" hint="8자 이상">
          <input className={inputClass} type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
        </Field>
        <Field label="활동명 (가게 이름)" hint="마켓 화면에 셀러 이름으로 보여요">
          <input className={inputClass} value={form.name} onChange={set('name')} placeholder="예: 망원빈티지" />
        </Field>
        <Field label="연락처" hint="- 없이 숫자만 입력해도 돼요. 주최측만 볼 수 있어요.">
          <input className={inputClass} inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="01012345678" />
        </Field>
        <ErrorBox error={error} />
        <button className={`${btnPrimary} w-full`} disabled={busy}>
          {busy ? '가입하는 중…' : '셀러로 가입하기'}
        </button>
      </form>
    </Card>
  );
}
