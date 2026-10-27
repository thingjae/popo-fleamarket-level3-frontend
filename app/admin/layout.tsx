import Link from 'next/link';
import { RequireRole } from '@/components/require-role';

export const metadata = { title: '관리자 | 포포 플리마켓' };

const TABS = [
  { href: '/admin', label: '현황' },
  { href: '/admin/applications', label: '신청 관리' },
  { href: '/admin/markets', label: '마켓 관리' },
  { href: '/admin/equipment', label: '장비 관리' },
  { href: '/admin/inquiries', label: '문의함' },
];

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <RequireRole role="ADMIN">
      <nav className="mb-6 flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100">
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </RequireRole>
  );
}
