import { Suspense } from 'react';
import { Loading } from '@/components/ui';
import { ApplyForm } from './apply-form';

export const metadata = { title: '부스 신청 | 포포 플리마켓' };

export default function ApplyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ApplyForm />
    </Suspense>
  );
}
