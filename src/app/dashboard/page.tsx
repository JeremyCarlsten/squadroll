import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import DashboardClient from './DashboardClient';

export default async function Dashboard() {
  const session = await getSession();
  
  if (!session) {
    redirect('/');
  }
  
  return <DashboardClient session={session} />;
}
