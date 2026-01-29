import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getParty, joinParty } from '@/lib/redis';
import PartyClient from './PartyClient';

function isValidPartyCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}

export default async function PartyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  
  // Validate code format
  if (!code || !isValidPartyCode(code)) {
    redirect('/?error=invalid_code');
  }
  
  const partyCode = code.toUpperCase();
  const session = await getSession();
  
  // Check if party exists before redirecting unauthenticated users
  const partyExists = await getParty(partyCode);
  if (!partyExists) {
    if (session) {
      redirect('/dashboard?error=party_not_found');
    } else {
      redirect(`/?error=party_not_found&join=${partyCode}`);
    }
  }
  
  if (!session) {
    redirect(`/api/auth/steam?join=${partyCode}`);
  }
  
  let party = await getParty(partyCode);
  
  if (!party) {
    redirect('/dashboard?error=party_not_found');
  }
  
  // Auto-join if user is not already in the party
  const isMember = party.members.some(m => m.odId === session.steamId);
  if (!isMember) {
    party = await joinParty(partyCode, {
      odId: session.steamId,
      personaname: session.personaname,
      avatarfull: session.avatarfull,
      gamesLoaded: false,
    });
    
    if (!party) {
      redirect('/dashboard?error=party_not_found');
    }
  }
  
  return <PartyClient initialParty={party} session={session} />;
}
