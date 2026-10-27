'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge, btnDanger, Card, ErrorBox, Loading, PageTitle, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDay, MARKET_TONE, won } from '@/lib/format';
import type { Stats } from '@/lib/types';

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');
  const [resetting, setResetting] = useState(false);

  const load = useCallback(() => {
    api<Stats>('/admin/stats').then(setStats).catch(setError);
  }, []);
  useEffect(load, [load]);

  async function reset() {
    if (!window.confirm('모든 마켓, 신청, 장비, 문의, 셀러 계정을 처음 상태의 가상 데이터로 되돌릴까요?')) return;
    setResetting(true);
    setError(null);
    try {
      const r = await api<{ message: string; markets: number; applications: number }>('/admin/seed/reset', { method: 'POST' });
      setNotice(`${r.message} (마켓 ${r.markets}개, 신청 ${r.applications}건). 다시 로그인이 필요할 수 있어요.`);
      load();
    } catch (e) {
      setError(e);
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <PageTitle title="현황" desc="아직 끝나지 않은 마켓을 기준으로 한 숫자예요." />
      <div className="space-y-6">
        <ErrorBox error={error} />
        {notice && <SuccessBox>{notice}</SuccessBox>}
        {!stats ? (
          !error && <Loading />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Big label="남은 부스" value={`${stats.remainingBooths}`} unit="개" color="text-orange-600" desc={`열릴 마켓 ${stats.upcomingMarkets}곳 합계`} />
              <Big label="심사 대기" value={`${stats.pending}`} unit="건" color="text-sky-700" desc="승인이나 거절을 기다리는 신청" href="/admin/applications?view=PENDING" />
              <Big label="입금 확인 금액" value={won(stats.paidAmount)} color="text-emerald-700" desc="참가 확정된 신청의 금액 합계" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Small label="입금 대기" value={stats.unpaid} href="/admin/applications?view=UNPAID" />
              <Small label="환불 예정" value={stats.refundPending} warn={stats.refundPending > 0} href="/admin/applications?view=REFUND_PENDING" />
              <Small label="새 문의" value={stats.newInquiries} warn={stats.newInquiries > 0} href="/admin/inquiries" />
            </div>
            <Card className="overflow-x-auto">
              <h2 className="mb-3 font-bold">마켓별</h2>
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-stone-500">
                  <tr className="border-b border-stone-200">
                    <th className="py-2 font-medium">마켓</th>
                    <th className="py-2 font-medium">상태</th>
                    <th className="py-2 text-right font-medium">남은 부스</th>
                    <th className="py-2 text-right font-medium">심사 대기</th>
                    <th className="py-2 text-right font-medium">입금 대기</th>
                    <th className="py-2 text-right font-medium">입금 확인 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byMarket.map((r) => (
                    <tr key={r.marketId} className="border-b border-stone-100 last:border-0">
                      <td className="py-2">
                        <Link href={`/admin/applications?marketId=${r.marketId}`} className="hover:underline">
                          {r.title}
                        </Link>
                        <span className="ml-2 text-xs text-stone-400">{fmtDay(r.eventDate)}</span>
                      </td>
                      <td className="py-2">
                        <Badge tone={MARKET_TONE[r.state]}>{r.stateLabel}</Badge>
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {r.remainingBooths}/{r.totalBooths}
                      </td>
                      <td className="py-2 text-right tabular-nums">{r.pending}</td>
                      <td className="py-2 text-right tabular-nums">{r.unpaid}</td>
                      <td className="py-2 text-right tabular-nums">{won(r.paidAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">가상 데이터 다시 채우기</h2>
            <p className="text-sm text-stone-500">버튼 하나로 마켓 5개, 셀러 10명, 신청 25건, 장비 5종, 문의 3건의 처음 상태로 되돌려요.</p>
          </div>
          <button className={btnDanger} onClick={reset} disabled={resetting}>
            {resetting ? '채우는 중…' : '🔄 가상 데이터 다시 채우기'}
          </button>
        </Card>
      </div>
    </>
  );
}

function Big({ label, value, unit, color, desc, href }: { label: string; value: string; unit?: string; color: string; desc: string; href?: string }) {
  const body = (
    <Card className={href ? 'h-full transition hover:border-orange-300' : 'h-full'}>
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className={`mt-2 text-4xl font-bold tabular-nums ${color}`}>
        {value}
        {unit && <span className="ml-1 text-lg font-semibold text-stone-400">{unit}</span>}
      </p>
      <p className="mt-2 text-xs text-stone-400">{desc}</p>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Small({ label, value, warn, href }: { label: string; value: number; warn?: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${warn ? 'border-rose-200 bg-rose-50' : 'border-stone-200 bg-white'} hover:border-orange-300`}
    >
      <span className="text-sm text-stone-600">{label}</span>
      <span className={`text-xl font-bold tabular-nums ${warn ? 'text-rose-700' : 'text-stone-800'}`}>{value}</span>
    </Link>
  );
}
