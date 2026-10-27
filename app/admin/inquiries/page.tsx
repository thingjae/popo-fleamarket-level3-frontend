'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge, btnSecondary, Card, Empty, ErrorBox, Loading, PageTitle } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDateTime, fmtDay } from '@/lib/format';
import type { Inquiry } from '@/lib/types';

export default function AdminInquiriesPage() {
  const [list, setList] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(() => {
    api<Inquiry[]>('/admin/inquiries').then(setList).catch(setError);
  }, []);
  useEffect(load, [load]);

  async function toggle(q: Inquiry) {
    setError(null);
    try {
      await api(`/admin/inquiries/${q.id}`, { method: 'PATCH', body: { status: q.status === 'NEW' ? 'DONE' : 'NEW' } });
      load();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <>
      <PageTitle title="문의함" desc="신청 마감 뒤 셀러가 남긴 문의예요. 연락처로 직접 연락한 뒤 처리 완료로 바꿔 주세요." />
      <div className="space-y-3">
        <ErrorBox error={error} />
        {!list ? (
          !error && <Loading />
        ) : list.length === 0 ? (
          <Empty>문의가 없어요.</Empty>
        ) : (
          list.map((q) => (
            <Card key={q.id} className={q.status === 'DONE' ? 'opacity-60' : ''}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={q.status === 'NEW' ? 'orange' : 'gray'}>{q.status === 'NEW' ? '새 문의' : '처리 완료'}</Badge>
                    <span className="text-sm font-medium">{q.market.title}</span>
                    <span className="text-xs text-stone-400">{fmtDay(q.market.eventDate)}</span>
                  </div>
                  <p className="mt-2 text-stone-800">“{q.content}”</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {q.seller.name} · {q.seller.email} · {q.seller.phone} · {fmtDateTime(q.createdAt)}
                  </p>
                </div>
                <button className={btnSecondary} onClick={() => toggle(q)}>
                  {q.status === 'NEW' ? '처리 완료' : '다시 열기'}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
