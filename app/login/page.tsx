import { Suspense } from 'react';
import { Loading, PageTitle } from '@/components/ui';
import { LoginForm } from './login-form';

export const metadata = { title: '로그인 | 포포 플리마켓' };

export default function LoginPage() {
  return (
    <>
      <PageTitle title="로그인" desc="셀러와 주최측 운영진이 로그인해요. 구경만 하시는 분은 로그인하지 않아도 돼요." />
      <Suspense fallback={<Loading />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
