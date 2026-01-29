import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getParty } from '@/lib/redis';
import PartyClient from './PartyClient';

export default async function PartyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await getSession();
  
  if (!session) {
    redirect(`/?join=${code}`);
  }
  
  const party = await getParty(code.toUpperCase());
  
  if (!party) {
    redirect('/dashboard?error=party_not_found');
  }
  
  return <PartyClient initialParty={party} session={session} />;
}
