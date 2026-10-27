'use client';

import { useEffect, useState } from 'react';

// Render 무료 서버가 잠에서 깨는 동안 고장으로 보이지 않게 안내한다.
export function WakeBanner() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const on = (e: Event) => setSlow(Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener('api-slow', on);
    return () => window.removeEventListener('api-slow', on);
  }, []);
  if (!slow) return null;
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
      ⏳ 서버를 깨우는 중이에요. 무료 서버라 처음 접속할 때 최대 1분 정도 걸릴 수 있어요. 고장이 아니에요!
    </div>
  );
}
