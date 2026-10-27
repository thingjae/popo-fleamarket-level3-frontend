'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Badge, btnPrimary, Card, ErrorBox, Field, inputClass, Loading, SuccessBox } from '@/components/ui';
import { api, photoUrl } from '@/lib/api';
import { dDay, fmtDateTime, fmtDay, MARKET_TONE, won } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { MarketDetail, SellerPreview } from '@/lib/types';

export function MarketDetailView() {
  const { id } = useParams<{ id: string }>();
  const [m, setM] = useState<MarketDetail | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(() => {
    api<MarketDetail>(`/markets/${id}`).then(setM).catch(setError);
  }, [id]);
  useEffect(load, [load]);

  if (error && !m) return <ErrorBox error={error} />;
  if (!m) return <Loading />;

  const fillPct = Math.round((m.takenBooths / m.totalBooths) * 100);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
        ← 마켓 목록
      </Link>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={MARKET_TONE[m.state]}>{m.stateLabel}</Badge>
          <span className="text-sm font-bold text-orange-600">{dDay(m.eventDate)}</span>
          {m.autoApprove && m.state === 'OPEN' && <Badge tone="green">신청하면 바로 승인</Badge>}
        </div>
        <h1 className="mt-2 text-2xl font-bold">{m.title}</h1>
        <p className="mt-2 text-stone-600">
          🗓 {fmtDay(m.eventDate)} {m.startTime}–{m.endTime}
        </p>
        <p className="text-stone-600">
          📍 {m.place} · {m.address}
        </p>
        {m.description && <p className="mt-3 text-stone-700">{m.description}</p>}
      </Card>

      {/* 구매자용: 이 마켓의 성격 */}
      <Card>
        <h2 className="font-bold">이번 마켓에서 만날 수 있는 것</h2>
        {m.keywords.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">아직 확정된 셀러가 없어요.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {m.keywords.map((k, i) => (
              <span
                key={k.keyword}
                className={`rounded-full px-3 py-1 ${i < 3 ? 'bg-orange-600 text-sm font-semibold text-white' : 'bg-orange-50 text-xs text-orange-700'}`}
              >
                #{k.keyword}
                {k.count > 1 && <span className="ml-1 opacity-75">{k.count}</span>}
              </span>
            ))}
          </div>
        )}
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-bold">참가 셀러 미리보기 ({m.sellers.length}팀)</h2>
        {m.sellers.length === 0 ? (
          <p className="text-sm text-stone-500">승인된 셀러가 생기면 여기에 보여요.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {m.sellers.map((s) => (
              <SellerCard key={s.applicationId} s={s} />
            ))}
          </ul>
        )}
      </section>

      {/* 셀러용: 신청 정보 */}
      {m.state !== 'ENDED' && (
        <Card>
          <h2 className="font-bold">셀러 참가 안내</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Info label="남은 부스">
              <span className={m.remainingBooths <= 3 ? 'text-rose-600' : ''}>
                {m.remainingBooths} / {m.totalBooths}
              </span>
              <div className="mt-2 h-2 rounded-full bg-stone-100">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: `${fillPct}%` }} />
              </div>
            </Info>
            <Info label="기본 부스비">{won(m.baseFee)} / 부스 1개</Info>
            <Info label="신청 마감">{fmtDateTime(m.applyDeadline)}</Info>
          </div>
          <h3 className="mt-5 text-sm font-semibold text-stone-700">대여 장비 (선택, 직접 가져와도 돼요)</h3>
          <ul className="mt-2 divide-y divide-stone-100 text-sm">
            {m.equipment.map((e) => (
              <li key={e.id} className="flex justify-between py-1.5">
                <span>
                  {e.name}
                  {e.description && <span className="ml-1 text-xs text-stone-400">{e.description}</span>}
                </span>
                <span className="text-stone-600">
                  {won(e.unitPrice)} · 남은 {e.remaining}개
                </span>
              </li>
            ))}
          </ul>
          <SellerCta market={m} />
        </Card>
      )}
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <p className="text-xs text-stone-500">{label}</p>
      <div className="mt-1 font-bold">{children}</div>
    </div>
  );
}

function SellerCard({ s }: { s: SellerPreview }) {
  return (
    <li className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {s.photoIds.length > 0 && (
        <div className="flex snap-x gap-1 overflow-x-auto">
          {s.photoIds.map((pid) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={pid} src={photoUrl(pid)} alt={`${s.sellerName} 판매 물품`} className="h-40 w-40 shrink-0 snap-start object-cover" loading="lazy" />
          ))}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{s.sellerName}</h3>
          <span className="text-xs text-stone-400">부스 {s.boothCount}개</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">{s.intro}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {s.keywords.map((k) => (
            <span key={k} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
              #{k}
            </span>
          ))}
        </div>
        {s.saleLinks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            {s.saleLinks.map((l) => (
              <a key={l} href={l} target="_blank" rel="noopener noreferrer" className="text-orange-700 underline">
                {linkLabel(l)}
              </a>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

function linkLabel(url: string) {
  if (url.includes('bunjang')) return '번개장터에서 보기';
  if (url.includes('fruitsfamily')) return '후루츠패밀리에서 보기';
  if (url.includes('joongna')) return '중고나라에서 보기';
  return '판매 링크';
}

/** 신청 중이면 신청 버튼, 마감이면 문의 창구 */
function SellerCta({ market }: { market: MarketDetail }) {
  const { ready, session } = useSession();
  const role = session?.user.role;
  if (!ready) return null;

  if (market.state === 'OPEN') {
    if (role === 'ADMIN') return <p className="mt-5 text-sm text-stone-500">관리자 계정은 신청 대신 관리자 화면에서 신청을 관리해요.</p>;
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link href={session ? `/markets/${market.id}/apply` : `/login?next=/markets/${market.id}/apply`} className={btnPrimary}>
          부스 신청하기
        </Link>
        {!session && <span className="text-xs text-stone-500">셀러 로그인이 필요해요. 처음이면 셀러 가입부터!</span>}
      </div>
    );
  }
  return <InquiryBox marketId={market.id} loggedInSeller={role === 'SELLER'} />;
}

function InquiryBox({ marketId, loggedInSeller }: { marketId: number; loggedInSeller: boolean }) {
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState('');

  if (!loggedInSeller) {
    return (
      <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        신청이 마감됐어요. 셀러라면{' '}
        <Link href={`/login?next=/markets/${marketId}`} className="font-semibold underline">
          로그인
        </Link>{' '}
        후 주최측에 문의를 남길 수 있어요.
      </p>
    );
  }

  return (
    <form
      className="mt-5 space-y-3 rounded-xl bg-amber-50 p-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const r = await api<{ message: string }>('/inquiries', { method: 'POST', body: { marketId, content } });
          setDone(r.message);
          setContent('');
        } catch (err) {
          setError(err);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="text-sm font-semibold text-amber-900">신청이 마감됐어요. 주최측에 문의를 남겨 주세요.</p>
      <Field label="문의 내용">
        <textarea className={inputClass} rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="예: 취소 자리가 생기면 1부스 참가하고 싶어요." />
      </Field>
      <ErrorBox error={error} />
      {done && <SuccessBox>{done}</SuccessBox>}
      <button className={btnPrimary} disabled={busy}>
        {busy ? '보내는 중…' : '문의 보내기'}
      </button>
    </form>
  );
}
