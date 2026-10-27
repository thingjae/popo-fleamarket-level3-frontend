import type { Application, MarketState } from './types';

// 화면에 보이는 시각은 모두 한국 시간으로 표시한다.
const KST = 'Asia/Seoul';

const dayFmt = new Intl.DateTimeFormat('ko-KR', { timeZone: KST, month: 'long', day: 'numeric', weekday: 'short' });
const timeFmt = new Intl.DateTimeFormat('ko-KR', { timeZone: KST, hour: '2-digit', minute: '2-digit', hour12: false });

/** "YYYY-MM-DD" → "11월 1일 (일)" */
export function fmtDay(dateStr: string) {
  return dayFmt.format(new Date(`${dateStr}T12:00:00+09:00`));
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${dayFmt.format(d)} ${timeFmt.format(d)}`;
}

export function won(n: number) {
  return `${n.toLocaleString('ko-KR')}원`;
}

/** 오늘(한국 시간)부터 행사일까지 남은 날 */
export function dDay(dateStr: string) {
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  const diff = Math.round((Date.parse(`${dateStr}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400e3);
  if (diff === 0) return '오늘';
  return diff > 0 ? `D-${diff}` : '지난 마켓';
}

type Tone = 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'orange';

export const TONE_CLASS: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  gray: 'bg-stone-100 text-stone-600 ring-stone-500/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
};

export const MARKET_TONE: Record<MarketState, Tone> = { OPEN: 'green', CLOSED: 'amber', ENDED: 'gray' };

export function applicationTone(a: Pick<Application, 'status' | 'paymentStatus'>): Tone {
  if (a.status === 'PENDING') return 'blue';
  if (a.status === 'APPROVED') return a.paymentStatus === 'PAID' ? 'green' : 'orange';
  if (a.status === 'REJECTED') return 'red';
  return 'gray';
}
