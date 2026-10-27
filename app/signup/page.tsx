import { Suspense } from 'react';
import { Loading, PageTitle } from '@/components/ui';
import { SignupForm } from './signup-form';

export const metadata = { title: '셀러 가입 | 포포 플리마켓' };

export default function SignupPage() {
  return (
    <>
      <PageTitle title="셀러 가입" desc="가입한 뒤 열리는 마켓마다 부스를 신청할 수 있어요." />
      <Suspense fallback={<Loading />}>
        <SignupForm />
      </Suspense>
    </>
  );
}
