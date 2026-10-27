'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApplicationCard } from '@/components/application-card';
import { btnDanger, btnPrimary, btnSecondary, Empty, ErrorBox, inputClass, Loading, PageTitle, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import type { Application, MarketListItem } from '@/lib/types';

const VIEWS = [
  { id: '', label: '전체' },
  { id: 'PENDING', label: '심사 대기' },
  { id: 'UNPAID', label: '입금 대기' },
  { id: 'PAID', label: '참가 확정' },
  { id: 'REFUND_PENDING', label: '환불 예정' },
  { id: 'REJECTED', label: '거절' },
  { id: 'CANCELED', label: '취소' },
];

export function ApplicationsAdmin() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = params.get('view') ?? '';
  const marketId = params.get('marketId') ?? '';

  const [markets, setMarkets] = useState<MarketListItem[]>([]);
  const [result, setResult] = useState<{ query: string; list: Application[] } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');

  const q = new URLSearchParams();
  if (view) q.set('view', view);
  if (marketId) q.set('marketId', marketId);
  const query = q.toString();
  const list = result?.query === query ? result.list : null;

  useEffect(() => {
    api<MarketListItem[]>('/markets').then(setMarkets).catch(setError);
  }, []);

  // 처리 버튼을 누르면 reload 를 올려서 목록을 다시 불러온다
  const [reload, setReload] = useState(0);
  useEffect(() => {
    api<Application[]>(`/admin/applications?${query}`)
      .then((r) => setResult({ query, list: r }))
      .catch(setError);
  }, [query, reload]);
  const load = () => setReload((n) => n + 1);

  function update(next: Record<string, string>) {
    const n = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) n.set(k, v);
      else n.delete(k);
    }
    router.replace(`${pathname}?${n}`, { scroll: false });
  }

  async function act(a: Application, action: 'approve' | 'reject' | 'confirm-payment' | 'refund') {
    let body: { reason?: string } | undefined;
    if (action === 'reject') {
      const reason = window.prompt(`${a.seller.name}님의 신청을 거절할까요? 셀러에게 보일 이유를 적어 주세요.`, '이번 마켓 컨셉과 맞지 않아요.');
      if (reason === null) return;
      body = { reason };
    }
    setError(null);
    setNotice('');
    try {
      await api(`/admin/applications/${a.id}/${action}`, { method: 'POST', body: body ?? {} });
      const label = { approve: '승인했어요', reject: '거절했어요', 'confirm-payment': '입금을 확인했어요', refund: '환불 완료로 바꿨어요' }[action];
      setNotice(`신청 #${a.id} (${a.seller.name}) ${label}.`);
      load();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <>
      <PageTitle title="신청 관리" desc="승인하면 셀러에게 가상계좌가 안내되고, 3일 안에 입금 확인이 안 되면 자동 취소돼요." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.id || 'all'}
            onClick={() => update({ view: v.id })}
            className={`rounded-full px-3 py-1 text-sm font-medium ${view === v.id ? 'bg-orange-600 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100'}`}
          >
            {v.label}
          </button>
        ))}
        <select className={`${inputClass} ml-auto max-w-64 py-1`} value={marketId} onChange={(e) => update({ marketId: e.target.value })} aria-label="마켓">
          <option value="">모든 마켓</option>
          {markets.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        <ErrorBox error={error} />
        {notice && <SuccessBox>{notice}</SuccessBox>}
        {!list ? (
          !error && <Loading />
        ) : list.length === 0 ? (
          <Empty>조건에 맞는 신청이 없어요.</Empty>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => (
              <ApplicationCard
                key={a.id}
                a={a}
                showSeller
                actions={
                  <>
                    {a.status === 'PENDING' && (
                      <>
                        <button className={btnPrimary} onClick={() => act(a, 'approve')}>
                          승인
                        </button>
                        <button className={btnDanger} onClick={() => act(a, 'reject')}>
                          거절
                        </button>
                      </>
                    )}
                    {a.status === 'APPROVED' && a.paymentStatus === 'UNPAID' && (
                      <button className={btnPrimary} onClick={() => act(a, 'confirm-payment')}>
                        입금 확인
                      </button>
                    )}
                    {a.paymentStatus === 'REFUND_PENDING' && (
                      <button className={btnSecondary} onClick={() => act(a, 'refund')}>
                        환불 완료
                      </button>
                    )}
                  </>
                }
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
