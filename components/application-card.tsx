import Link from 'next/link';
import type { ReactNode } from 'react';
import { applicationTone, fmtDateTime, fmtDay, won } from '@/lib/format';
import type { Application } from '@/lib/types';
import { Badge } from './ui';

/** 신청 한 건 (셀러의 내 신청, 관리자 신청 관리에서 같이 쓴다) */
export function ApplicationCard({ a, showSeller, actions }: { a: Application; showSeller?: boolean; actions?: ReactNode }) {
  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={applicationTone(a)}>{a.statusLabel}</Badge>
            <span className="text-xs text-stone-400">신청 #{a.id}</span>
          </div>
          <Link href={`/markets/${a.market.id}`} className="mt-1 block font-bold hover:underline">
            {a.market.title}
          </Link>
          <p className="text-sm text-stone-500">
            {fmtDay(a.market.eventDate)} · {a.market.place}
          </p>
          {showSeller && (
            <p className="mt-1 text-sm text-stone-700">
              🧑 {a.seller.name} · {a.seller.email} · {a.seller.phone}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{won(a.totalFee)}</p>
          <p className="text-xs text-stone-500">
            부스 {a.boothCount}개
            {a.equipment.map((e) => ` · ${e.name} ${e.quantity}`).join('')}
          </p>
        </div>
      </div>

      {a.account && a.paymentDueAt && (
        <div className="mt-3 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-900">
          <p className="font-semibold">입금 안내 (가상계좌)</p>
          <p className="mt-1">
            {a.account.bank} <b>{a.account.number}</b> · 예금주 {a.account.holder}
          </p>
          <p>
            입금자명 <b>{a.account.depositor}</b> · 금액 <b>{won(a.totalFee)}</b>
          </p>
          <p className="mt-1 font-semibold text-rose-700">입금 기한 {fmtDateTime(a.paymentDueAt)} (지나면 자동 취소)</p>
        </div>
      )}
      {a.status === 'REJECTED' && a.rejectReason && (
        <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">거절 이유: {a.rejectReason}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {a.keywords.map((k) => (
          <span key={k} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
            #{k}
          </span>
        ))}
      </div>
      {showSeller && <p className="mt-2 text-sm text-stone-600">{a.intro}</p>}

      {actions && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">{actions}</div>}
    </li>
  );
}
