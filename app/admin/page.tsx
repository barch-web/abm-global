import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  return <AdminDashboard />;
}
