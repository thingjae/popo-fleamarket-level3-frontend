'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, Empty, ErrorBox, inputClass, Loading } from '@/components/ui';
import { api } from '@/lib/api';
import { dDay, fmtDay, MARKET_TONE, won } from '@/lib/format';
import type { MarketListItem } from '@/lib/types';

const STATES = [
  { id: 'UPCOMING', label: '열릴 마켓' },
  { id: 'OPEN', label: '신청 중' },
  { id: '', label: '전체' },
  { id: 'ENDED', label: '지난 마켓' },
];

export function MarketList() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const keyword = params.get('keyword') ?? '';
  const neighborhood = params.get('neighborhood') ?? '';
  const state = params.get('state') ?? 'UPCOMING';
  const weekend = params.get('weekend') === 'true';

  const [typed, setTyped] = useState(keyword);
  const [hoods, setHoods] = useState<string[]>([]);
  const [result, setResult] = useState<{ query: string; items: MarketListItem[] } | null>(null);
  const [error, setError] = useState<unknown>(null);

  const q = new URLSearchParams();
  if (keyword) q.set('keyword', keyword);
  if (neighborhood) q.set('neighborhood', neighborhood);
  if (state && state !== 'ALL') q.set('state', state); // 'ALL' = 전체 (서버에는 보내지 않음)
  if (weekend) q.set('weekend', 'true');
  const query = q.toString();
  const items = result?.query === query ? result.items : null;

  // 동네 목록은 전체 마켓에서 뽑는다
  useEffect(() => {
    api<MarketListItem[]>('/markets')
      .then((all) => setHoods([...new Set(all.map((m) => m.neighborhood))].sort()))
      .catch(setError);
  }, []);

  useEffect(() => {
    let alive = true;
    api<MarketListItem[]>(`/markets?${query}`)
      .then((r) => alive && (setResult({ query, items: r }), setError(null)))
      .catch((e) => alive && setError(e));
    return () => {
      alive = false;
    };
  }, [query]);

  // 검색 조건은 주소(URL)에 남겨서 새로고침·공유해도 그대로
  function update(next: Record<string, string>) {
    const n = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) n.set(k, v);
      else n.delete(k);
    }
    router.replace(`${pathname}?${n}`, { scroll: false });
  }

  return (
    <div className="space-y-5">
      <form
        className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          update({ keyword: typed.trim() });
        }}
      >
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="마켓 이름이나 장소로 검색 (예: 망원, 빈티지)"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            aria-label="검색어"
          />
          <button className="shrink-0 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700">검색</button>
        </div>
        <select className={inputClass} value={neighborhood} onChange={(e) => update({ neighborhood: e.target.value })} aria-label="동네">
          <option value="">모든 동네</option>
          {hoods.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-stone-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-orange-600"
            checked={weekend}
            onChange={(e) => update({ weekend: e.target.checked ? 'true' : '' })}
          />
          이번 주말만
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-3">
          {STATES.map((s) => (
            <button
              key={s.id || 'all'}
              type="button"
              onClick={() => update({ state: s.id || 'ALL' })}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                (state === 'ALL' ? '' : state) === s.id ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </form>

      <ErrorBox error={error} />
      {items === null ? (
        !error && <Loading />
      ) : items.length === 0 ? (
        <Empty>조건에 맞는 마켓이 없어요. 검색어나 필터를 바꿔 보세요.</Empty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <li key={m.id}>
              <Link
                href={`/markets/${m.id}`}
                className={`flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow ${m.state === 'ENDED' ? 'opacity-70' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={MARKET_TONE[m.state]}>{m.stateLabel}</Badge>
                  <span className="text-sm font-bold text-orange-600">{dDay(m.eventDate)}</span>
                </div>
                <h2 className="mt-3 text-lg font-bold">{m.title}</h2>
                <p className="mt-1 text-sm text-stone-600">
                  🗓 {fmtDay(m.eventDate)} {m.startTime}–{m.endTime}
                </p>
                <p className="text-sm text-stone-600">📍 {m.neighborhood} · {m.place}</p>
                {m.topKeywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.topKeywords.map((k) => (
                      <span key={k.keyword} className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700">
                        #{k.keyword}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-xs text-stone-500">
                  <span>셀러 {m.sellerCount}팀</span>
                  {m.state !== 'ENDED' && (
                    <span className={m.remainingBooths <= 3 ? 'font-semibold text-rose-600' : ''}>
                      남은 부스 {m.remainingBooths}/{m.totalBooths}
                    </span>
                  )}
                  <span>부스 {won(m.baseFee)}~</span>
                  {m.autoApprove && m.state === 'OPEN' && <span className="text-emerald-700">바로 승인</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
