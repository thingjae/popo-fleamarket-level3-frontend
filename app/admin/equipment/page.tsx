'use client';

import { useCallback, useEffect, useState } from 'react';
import { btnDanger, btnPrimary, btnSecondary, Card, ErrorBox, Field, inputClass, Loading, PageTitle, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import { won } from '@/lib/format';
import type { Equipment } from '@/lib/types';

type Form = { name: string; unitPrice: string; totalQuantity: string; description: string };
const EMPTY: Form = { name: '', unitPrice: '', totalQuantity: '', description: '' };
const num = (v: string) => (v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : v.trim() === '' ? undefined : v);

export default function AdminEquipmentPage() {
  const [list, setList] = useState<Equipment[] | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    api<Equipment[]>('/equipment').then(setList).catch(setError);
  }, []);
  useEffect(load, [load]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      const body = { name: form.name, unitPrice: num(form.unitPrice), totalQuantity: num(form.totalQuantity), description: form.description };
      if (editing) await api(`/equipment/${editing}`, { method: 'PATCH', body });
      else await api('/equipment', { method: 'POST', body });
      setNotice(editing ? '장비를 수정했어요.' : '장비를 등록했어요.');
      setForm(EMPTY);
      setEditing(null);
      load();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function remove(eq: Equipment) {
    if (!window.confirm(`${eq.name}을(를) 삭제할까요?`)) return;
    setError(null);
    setNotice('');
    try {
      const r = await api<{ message: string }>(`/equipment/${eq.id}`, { method: 'DELETE' });
      setNotice(r.message);
      load();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <>
      <PageTitle title="장비 관리" desc="셀러에게 빌려주는 장비와 대여료, 보유 수량이에요. 마켓마다 이 수량 안에서 빌려줄 수 있어요." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h2 className="font-bold">{editing ? `장비 수정 (#${editing})` : '새 장비 등록'}</h2>
          <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
            <Field label="장비 이름 *">
              <input className={inputClass} value={form.name} onChange={set('name')} placeholder="예: 조명 스탠드" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="1개 대여료 (원) *">
                <input className={inputClass} inputMode="numeric" value={form.unitPrice} onChange={set('unitPrice')} placeholder="5000" />
              </Field>
              <Field label="보유 수량 *">
                <input className={inputClass} inputMode="numeric" value={form.totalQuantity} onChange={set('totalQuantity')} placeholder="10" />
              </Field>
            </div>
            <Field label="설명">
              <input className={inputClass} value={form.description} onChange={set('description')} />
            </Field>
            <ErrorBox error={error} />
            {notice && <SuccessBox>{notice}</SuccessBox>}
            <div className="flex gap-2">
              <button className={btnPrimary} disabled={busy}>
                {busy ? '저장 중…' : editing ? '수정 저장' : '장비 등록'}
              </button>
              {editing && (
                <button type="button" className={btnSecondary} onClick={() => (setEditing(null), setForm(EMPTY))}>
                  취소
                </button>
              )}
            </div>
          </form>
        </Card>

        <Card className="overflow-x-auto p-0">
          {!list ? (
            <Loading />
          ) : (
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-stone-50 text-left text-stone-500">
                <tr>
                  <th className="px-4 py-2 font-medium">장비</th>
                  <th className="px-4 py-2 text-right font-medium">대여료</th>
                  <th className="px-4 py-2 text-right font-medium">보유</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {list.map((eq) => (
                  <tr key={eq.id} className="border-t border-stone-100">
                    <td className="px-4 py-2">
                      <p className="font-medium">{eq.name}</p>
                      {eq.description && <p className="text-xs text-stone-400">{eq.description}</p>}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{won(eq.unitPrice)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{eq.totalQuantity}개</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className={`${btnSecondary} px-3 py-1`}
                          onClick={() => {
                            setEditing(eq.id);
                            setForm({ name: eq.name, unitPrice: String(eq.unitPrice), totalQuantity: String(eq.totalQuantity), description: eq.description });
                          }}
                        >
                          수정
                        </button>
                        <button className={btnDanger} onClick={() => remove(eq)}>
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
