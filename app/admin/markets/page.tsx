'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge, btnPrimary, btnSecondary, Card, ErrorBox, Field, inputClass, Loading, PageTitle, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDay, MARKET_TONE, won } from '@/lib/format';
import type { MarketListItem } from '@/lib/types';

type Form = {
  title: string;
  neighborhood: string;
  place: string;
  address: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  totalBooths: string;
  baseFee: string;
  autoApprove: boolean;
  description: string;
};

const EMPTY: Form = {
  title: '',
  neighborhood: '',
  place: '',
  address: '',
  eventDate: '',
  startTime: '12:00',
  endTime: '18:00',
  totalBooths: '',
  baseFee: '',
  autoApprove: false,
  description: '',
};

// 숫자 칸에 글자를 넣으면 그대로 보내서 서버가 "숫자로 입력해 주세요"라고 안내하게 한다
const num = (v: string) => (v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : v.trim() === '' ? undefined : v);

export default function AdminMarketsPage() {
  const [list, setList] = useState<MarketListItem[] | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    api<MarketListItem[]>('/markets').then(setList).catch(setError);
  }, []);
  useEffect(load, [load]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  function startEdit(m: MarketListItem) {
    setEditing(m.id);
    setForm({
      title: m.title,
      neighborhood: m.neighborhood,
      place: m.place,
      address: m.address,
      eventDate: m.eventDate,
      startTime: m.startTime,
      endTime: m.endTime,
      totalBooths: String(m.totalBooths),
      baseFee: String(m.baseFee),
      autoApprove: m.autoApprove,
      description: m.description,
    });
    setNotice('');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      const body = { ...form, totalBooths: num(form.totalBooths), baseFee: num(form.baseFee) };
      if (editing) await api(`/markets/${editing}`, { method: 'PATCH', body });
      else await api('/markets', { method: 'POST', body });
      setNotice(editing ? '마켓을 수정했어요.' : '새 마켓을 등록했어요. 이제 셀러가 신청할 수 있어요.');
      setForm(EMPTY);
      setEditing(null);
      load();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="마켓 관리" desc="마켓을 열고, 마켓마다 자동 승인을 켜거나 끌 수 있어요." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <h2 className="font-bold">{editing ? `마켓 수정 (#${editing})` : '새 마켓 등록'}</h2>
          <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
            <Field label="마켓 이름 *">
              <input className={inputClass} value={form.title} onChange={set('title')} placeholder="예: 포포 망원 주말 플리마켓" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="동네 *">
                <input className={inputClass} value={form.neighborhood} onChange={set('neighborhood')} placeholder="망원동" />
              </Field>
              <Field label="장소 *">
                <input className={inputClass} value={form.place} onChange={set('place')} placeholder="망원 포포광장" />
              </Field>
            </div>
            <Field label="주소 *">
              <input className={inputClass} value={form.address} onChange={set('address')} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="행사일 *">
                <input className={inputClass} type="date" value={form.eventDate} onChange={set('eventDate')} />
              </Field>
              <Field label="시작 *">
                <input className={inputClass} type="time" value={form.startTime} onChange={set('startTime')} />
              </Field>
              <Field label="끝 *">
                <input className={inputClass} type="time" value={form.endTime} onChange={set('endTime')} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="전체 부스 수 *">
                <input className={inputClass} inputMode="numeric" value={form.totalBooths} onChange={set('totalBooths')} placeholder="30" />
              </Field>
              <Field label="부스 1개 기본비 (원) *">
                <input className={inputClass} inputMode="numeric" value={form.baseFee} onChange={set('baseFee')} placeholder="30000" />
              </Field>
            </div>
            <label className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-orange-600" checked={form.autoApprove} onChange={set('autoApprove')} />
              <span>
                <b>자동 승인</b> — 신청하면 심사 없이 바로 승인 (입금 기한 3일 시작)
              </span>
            </label>
            <Field label="소개">
              <textarea className={inputClass} rows={3} value={form.description} onChange={set('description')} />
            </Field>
            <ErrorBox error={error} />
            {notice && <SuccessBox>{notice}</SuccessBox>}
            <div className="flex gap-2">
              <button className={btnPrimary} disabled={busy}>
                {busy ? '저장 중…' : editing ? '수정 저장' : '마켓 등록'}
              </button>
              {editing && (
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => {
                    setEditing(null);
                    setForm(EMPTY);
                  }}
                >
                  취소
                </button>
              )}
            </div>
          </form>
        </Card>

        <div className="space-y-3">
          {!list ? (
            <Loading />
          ) : (
            list.map((m) => (
              <Card key={m.id} className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={MARKET_TONE[m.state]}>{m.stateLabel}</Badge>
                    {m.autoApprove && <Badge tone="green">자동 승인</Badge>}
                  </div>
                  <p className="mt-1 font-bold">{m.title}</p>
                  <p className="text-sm text-stone-500">
                    {fmtDay(m.eventDate)} · {m.neighborhood} · 부스 {m.totalBooths - m.remainingBooths}/{m.totalBooths} · {won(m.baseFee)}
                  </p>
                </div>
                {m.state !== 'ENDED' && (
                  <button className={btnSecondary} onClick={() => startEdit(m)}>
                    수정
                  </button>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
