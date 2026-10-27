'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ApplicationCard } from '@/components/application-card';
import { RequireRole } from '@/components/require-role';
import { btnDanger, Empty, ErrorBox, Loading, PageTitle, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDateTime } from '@/lib/format';
import type { Application } from '@/lib/types';

export default function MyPage() {
  return (
    <>
      <PageTitle title="내 신청" desc="내가 신청한 부스만 보여요. 승인되면 가상계좌와 입금 기한이 나타나요." />
      <RequireRole role="SELLER">
        <MyApplications />
      </RequireRole>
    </>
  );
}

function MyApplications() {
  const [list, setList] = useState<Application[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    api<Application[]>('/applications/mine').then(setList).catch(setError);
  }, []);
  useEffect(load, [load]);

  async function cancel(a: Application) {
    if (!window.confirm(`${a.market.title} 신청을 취소할까요?`)) return;
    setError(null);
    setNotice('');
    try {
      const r = await api<Application>(`/applications/${a.id}/cancel`, { method: 'POST' });
      setNotice(r.message ?? '신청을 취소했어요.');
      load();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <div className="space-y-4">
      <ErrorBox error={error} />
      {notice && <SuccessBox>{notice}</SuccessBox>}
      {!list ? (
        !error && <Loading />
      ) : list.length === 0 ? (
        <Empty>
          아직 신청한 부스가 없어요.{' '}
          <Link href="/" className="text-orange-700 underline">
            열릴 마켓 보러 가기
          </Link>
        </Empty>
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <ApplicationCard
              key={a.id}
              a={a}
              actions={
                a.canCancel ? (
                  <>
                    <button className={btnDanger} onClick={() => cancel(a)}>
                      신청 취소
                    </button>
                    <span className="text-xs text-stone-400">취소 가능 기한 {fmtDateTime(a.cancelDeadline)}</span>
                  </>
                ) : undefined
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}
