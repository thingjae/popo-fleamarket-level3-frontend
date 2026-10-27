import { Suspense } from 'react';
import { Loading } from '@/components/ui';
import { MarketList } from './market-list';

export default function Home() {
  return (
    <>
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 px-6 py-8 text-white">
        <p className="text-sm font-semibold opacity-90">마포구 주말 플리마켓</p>
        <h1 className="mt-1 text-3xl font-bold">이번 주말, 어디서 열리지?</h1>
        <p className="mt-2 max-w-xl text-sm opacity-90">
          망원·연남·합정·상수에서 열리는 플리마켓을 한눈에. 마켓을 누르면 어떤 셀러가 무엇을 가져오는지 미리 볼 수 있어요.
        </p>
      </section>
      <Suspense fallback={<Loading />}>
        <MarketList />
      </Suspense>
    </>
  );
}
