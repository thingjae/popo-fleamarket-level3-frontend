import { Suspense } from 'react';
import { Loading } from '@/components/ui';
import { ApplicationsAdmin } from './applications-admin';

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ApplicationsAdmin />
    </Suspense>
  );
}
