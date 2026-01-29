import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import HomeClient from './HomeClient';

export default async function Home() {
  const session = await getSession();
  
  // Redirect logged-in users to dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  return <HomeClient />;
}
