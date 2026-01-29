import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSession } from '@/lib/session';
import DashboardClient from './DashboardClient';

export default async function Dashboard() {
  const session = await getSession();
  
  if (!session) {
    redirect('/');
  }
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <DashboardClient session={session} />
    </Suspense>
  );
}
