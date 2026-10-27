import type { ReactNode } from 'react';
import { ApiError } from '@/lib/api';
import { TONE_CLASS } from '@/lib/format';

export function PageTitle({ title, desc, children }: { title: string; desc?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
        {desc && <p className="mt-1 text-sm text-stone-500">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export function Badge({ tone, children }: { tone: keyof typeof TONE_CLASS; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-stone-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

// 규칙마다 사용자가 이해하기 쉬운 제목. 규칙 번호는 오른쪽에 작게만 보여 준다.
function titleOf(code: string | undefined) {
  switch (code) {
    case 'R1':
    case 'R2':
    case 'R3':
    case 'R7':
      return '신청할 수 없어요';
    case 'R4':
      return '취소할 수 없어요';
    case 'R5':
      return '처리할 수 없어요';
    case 'R6':
      return '권한이 없어요';
    case 'R8':
      return '삭제할 수 없어요';
    case 'R9':
      return '로그인이 필요해요';
    case 'VALIDATION':
      return '입력한 값을 확인해 주세요';
    case 'LOGIN':
      return '로그인하지 못했어요';
    default:
      return '요청을 처리하지 못했어요';
  }
}

/** 서버가 거절한 이유를 그대로 보여 준다 */
export function ErrorBox({ error }: { error: unknown }) {
  if (!error) return null;
  const e = error instanceof ApiError ? error : null;
  const message = error instanceof Error ? error.message : String(error);
  const isRule = e && /^R\d$/.test(e.code);
  return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <p className="flex items-start justify-between gap-2 font-semibold">
        <span>{titleOf(e?.code)}</span>
        {isRule && <span className="shrink-0 text-xs font-normal text-stone-400">규칙 {e.code}</span>}
      </p>
      <p className="mt-1">{message}</p>
      {e && e.messages.length > 1 && (
        <ul className="mt-1 list-disc pl-5 text-rose-700">
          {e.messages.slice(1).map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SuccessBox({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      {children}
    </div>
  );
}

export function Loading({ text = '불러오는 중…' }: { text?: string }) {
  return <p className="py-10 text-center text-sm text-stone-400">{text}</p>;
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-stone-300 bg-white py-10 text-center text-sm text-stone-500">{children}</p>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20';

export const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50';

export const btnSecondary =
  'inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50';

export const btnDanger =
  'inline-flex items-center justify-center rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50';
