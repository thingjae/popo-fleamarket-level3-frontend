'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { btnPrimary, btnSecondary, Card, ErrorBox, Field, inputClass, Loading, SuccessBox } from '@/components/ui';
import { api, ApiError, photoUrl } from '@/lib/api';
import { fmtDateTime, fmtDay, won } from '@/lib/format';
import { shrinkImage } from '@/lib/image';
import { useSession } from '@/lib/session';
import type { Application, MarketDetail } from '@/lib/types';

const MAX_PHOTOS = 10;
type AiResult = { intro: string; missingKeywords: string[] };

export function ApplyForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, session } = useSession();
  const [m, setM] = useState<MarketDetail | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);

  const [boothCount, setBoothCount] = useState(1);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState('');
  const [memo, setMemo] = useState('');
  const [intro, setIntro] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<unknown>(null);
  const [aiMissing, setAiMissing] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>(['']);
  const [photos, setPhotos] = useState<number[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState<Application | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<MarketDetail>(`/markets/${id}`).then(setM).catch(setLoadError);
  }, [id]);

  // 로그인하지 않았으면 로그인 화면으로
  useEffect(() => {
    if (ready && !session) router.replace(`/login?next=/markets/${id}/apply`);
  }, [ready, session, router, id]);

  if (loadError) return <ErrorBox error={loadError} />;
  if (!m || !ready || !session) return <Loading />;
  if (session.user.role !== 'SELLER') {
    return <ErrorBox error={new ApiError(403, 'R6', '셀러 계정으로만 부스를 신청할 수 있어요.')} />;
  }

  const lines = m.equipment.filter((e) => (qty[e.id] ?? 0) > 0);
  const total = m.baseFee * boothCount + lines.reduce((s, e) => s + e.unitPrice * (qty[e.id] ?? 0), 0);

  function addKeyword(raw: string) {
    const parts = raw.split(/[,\s]+/).map((k) => k.replace(/^#/, '').trim()).filter(Boolean);
    setKeywords((prev) => [...new Set([...prev, ...parts])].slice(0, 10));
    setKwInput('');
  }

  async function makeIntro() {
    setAiBusy(true);
    setAiError(null);
    try {
      const all = kwInput.trim() ? [...new Set([...keywords, ...kwInput.split(/[,\s]+/).filter(Boolean)])] : keywords;
      if (kwInput.trim()) addKeyword(kwInput);
      const r = await api<AiResult>('/ai/seller-intro', { method: 'POST', body: { keywords: all, memo } });
      setIntro(r.intro);
      setAiMissing(r.missingKeywords);
    } catch (e) {
      setAiError(e);
    } finally {
      setAiBusy(false);
    }
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setPhotoError(null);
    const room = MAX_PHOTOS - photos.length;
    if (files.length > room) setPhotoError(new Error(`사진은 ${MAX_PHOTOS}장까지 올릴 수 있어요. 앞의 ${room}장만 올릴게요.`));
    setPhotoBusy(true);
    try {
      for (const file of Array.from(files).slice(0, room)) {
        const blob = await shrinkImage(file);
        const fd = new FormData();
        fd.append('file', blob, 'photo.jpg');
        const r = await api<{ id: number }>('/photos', { method: 'POST', form: fd });
        setPhotos((p) => [...p, r.id]);
      }
    } catch (e) {
      setPhotoError(e);
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (kwInput.trim()) addKeyword(kwInput);
      const r = await api<Application>('/applications', {
        method: 'POST',
        body: {
          marketId: m!.id,
          boothCount,
          equipment: lines.map((l) => ({ equipmentId: l.id, quantity: qty[l.id] })),
          keywords: kwInput.trim() ? [...new Set([...keywords, ...kwInput.split(/[,\s]+/).filter(Boolean)])] : keywords,
          memo,
          intro,
          saleLinks: links.map((l) => l.trim()).filter(Boolean),
          photoIds: photos,
        },
      });
      setDone(r);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <p className="text-4xl">🎉</p>
        <h1 className="mt-2 text-xl font-bold">{done.status === 'APPROVED' ? '신청이 바로 승인됐어요!' : '신청이 접수됐어요!'}</h1>
        <p className="mt-2 text-stone-600">{done.message}</p>
        <p className="mt-1 text-sm text-stone-500">총 금액 {won(done.totalFee)}</p>
        <Link href="/my" className={`${btnPrimary} mt-5`}>
          내 신청에서 확인하기
        </Link>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div>
        <Link href={`/markets/${m.id}`} className="text-sm text-stone-500 hover:text-stone-800">
          ← {m.title}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">부스 신청</h1>
        <p className="mt-1 text-sm text-stone-500">
          {fmtDay(m.eventDate)} · {m.place} · 신청 마감 {fmtDateTime(m.applyDeadline)}
          {m.autoApprove ? ' · 신청하면 바로 승인돼요' : ' · 주최측 심사 후 승인돼요'}
        </p>
      </div>

      <Card>
        <h2 className="font-bold">1. 부스와 장비</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="부스 수" hint={`남은 부스 ${m.remainingBooths}개 · 부스 1개 ${won(m.baseFee)}`}>
            <select className={inputClass} value={boothCount} onChange={(e) => setBoothCount(Number(e.target.value))}>
              {Array.from({ length: Math.max(1, Math.min(20, m.remainingBooths)) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}개
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="mt-4 text-sm font-medium text-stone-700">대여 장비 (필요한 만큼, 직접 가져와도 돼요)</p>
        <ul className="mt-2 divide-y divide-stone-100">
          {m.equipment.map((eq) => (
            <li key={eq.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>
                {eq.name} <span className="text-stone-500">{won(eq.unitPrice)}</span>
                <span className="ml-1 text-xs text-stone-400">남은 {eq.remaining}개</span>
              </span>
              <input
                type="number"
                min={0}
                max={50}
                inputMode="numeric"
                className={`${inputClass} w-20 py-1 text-right`}
                value={qty[eq.id] ?? 0}
                onChange={(e) => setQty((q) => ({ ...q, [eq.id]: Math.max(0, Number(e.target.value) || 0) }))}
                aria-label={`${eq.name} 수량`}
              />
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span>부스 {boothCount}개 × {won(m.baseFee)}</span>
            <span>{won(m.baseFee * boothCount)}</span>
          </div>
          {lines.map((l) => (
            <div key={l.id} className="flex justify-between text-stone-600">
              <span>
                {l.name} {qty[l.id]}개
              </span>
              <span>{won(l.unitPrice * qty[l.id])}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-orange-200 pt-2 font-bold text-orange-800">
            <span>예상 금액</span>
            <span>{won(total)}</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">최종 금액은 서버가 다시 계산해요. 승인 뒤 가상계좌로 3일 안에 입금해요.</p>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold">2. 키워드와 소개글</h2>
        <p className="mt-1 text-sm text-stone-500">
          가져올 물건을 키워드로 알려 주세요. 키워드가 구체적일수록 AI 소개글도 구체적으로 나와요. (3~10개)
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {keywords.map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => setKeywords((p) => p.filter((x) => x !== k))}
              className="rounded-full bg-orange-600 px-3 py-1 text-sm text-white"
              title="눌러서 빼기"
            >
              #{k} ✕
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className={inputClass}
            value={kwInput}
            onChange={(e) => setKwInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                if (kwInput.trim()) addKeyword(kwInput);
              }
            }}
            placeholder="예: 빈티지, 리바이스, 밀리터리 (엔터로 추가)"
            aria-label="키워드"
          />
          <button type="button" className={btnSecondary} onClick={() => kwInput.trim() && addKeyword(kwInput)}>
            추가
          </button>
        </div>
        <div className="mt-3">
          <Field label="한 줄 메모 (선택)" hint="AI가 소개글에 참고해요. 예: 직접 수선한 데님이 많아요">
            <input className={inputClass} value={memo} onChange={(e) => setMemo(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className={btnPrimary} onClick={makeIntro} disabled={aiBusy}>
            {aiBusy ? 'AI가 쓰는 중…' : '✨ AI로 소개글 만들기'}
          </button>
          <span className="text-xs text-stone-500">마음에 들 때까지 다시 만들 수 있어요. 만든 뒤 자유롭게 고쳐 주세요.</span>
        </div>
        <div className="mt-3 space-y-2">
          <ErrorBox error={aiError} />
          <Field label="소개글" hint="승인되면 마켓 화면의 셀러 미리보기에 이 글이 보여요.">
            <textarea className={inputClass} rows={4} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="AI로 만들거나 직접 써 주세요." />
          </Field>
          {aiMissing.length > 0 && (
            <p className="text-xs text-amber-700">AI 글에 빠진 키워드: {aiMissing.map((k) => `#${k}`).join(' ')} — 필요하면 직접 넣어 주세요.</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="font-bold">3. 판매 링크와 사진 (선택)</h2>
        <p className="mt-1 text-sm text-stone-500">중고나라, 후루츠패밀리, 번개장터 등 판매 페이지 주소를 붙여 넣어 주세요.</p>
        <div className="mt-3 space-y-2">
          {links.map((l, i) => (
            <input
              key={i}
              className={inputClass}
              value={l}
              onChange={(e) => setLinks((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder="https://m.bunjang.co.kr/shop/..."
              aria-label={`판매 링크 ${i + 1}`}
            />
          ))}
          {links.length < 5 && (
            <button type="button" className="text-sm text-orange-700 underline" onClick={() => setLinks((p) => [...p, ''])}>
              + 링크 추가
            </button>
          )}
        </div>

        <p className="mt-5 text-sm font-medium text-stone-700">
          대표 사진 {photos.length}/{MAX_PHOTOS}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {photos.map((pid) => (
            <div key={pid} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl(pid)} alt="올린 사진" className="h-24 w-24 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setPhotos((p) => p.filter((x) => x !== pid))}
                className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-stone-800 text-xs text-white"
                aria-label="사진 빼기"
              >
                ✕
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 text-xs text-stone-500 hover:border-orange-400"
            >
              {photoBusy ? '올리는 중…' : (
                <>
                  <span className="text-2xl">＋</span>사진 추가
                </>
              )}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
        </div>
        <div className="mt-2">
          <ErrorBox error={photoError} />
        </div>
      </Card>

      <ErrorBox error={error} />
      {done && <SuccessBox>신청이 접수됐어요.</SuccessBox>}
      <button className={`${btnPrimary} w-full py-3 text-base`} disabled={busy}>
        {busy ? '신청하는 중…' : `${won(total)} 신청하기`}
      </button>
    </form>
  );
}
