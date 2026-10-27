import { Suspense } from 'react';
import { Loading } from '@/components/ui';
import { MarketDetailView } from './market-detail';

export const metadata = { title: '마켓 상세 | 포포 플리마켓' };

export default function MarketPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MarketDetailView />
    </Suspense>
  );
}
