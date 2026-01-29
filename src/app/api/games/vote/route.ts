import { NextRequest, NextResponse } from 'next/server';
import { updateMemberGenreVotes, getParty } from '@/lib/redis';

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get('steam_session');
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const session = JSON.parse(sessionCookie.value);
  const { partyCode, genres } = await request.json();
  
  if (!partyCode) {
    return NextResponse.json({ error: 'Party code required' }, { status: 400 });
  }
  
  if (!Array.isArray(genres)) {
    return NextResponse.json({ error: 'Genres must be an array' }, { status: 400 });
  }
  
  // Update the member's genre votes
  await updateMemberGenreVotes(partyCode.toUpperCase(), session.steamId, genres);
  
  // Return updated party state
  const party = await getParty(partyCode.toUpperCase());
  
  return NextResponse.json({ 
    success: true,
    votes: party?.members.map(m => ({
      odId: m.odId,
      personaname: m.personaname,
      genreVotes: m.genreVotes || [],
    })) || [],
  });
}
