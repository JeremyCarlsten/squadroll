import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createParty } from '@/lib/redis';

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get('steam_session');
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const session = JSON.parse(sessionCookie.value);
  
  // Generate short party code
  const code = nanoid(6).toUpperCase();
  
  const party = await createParty(code, session.steamId, {
    odId: session.steamId,
    personaname: session.personaname,
    avatarfull: session.avatarfull,
    gamesLoaded: false,
  });
  
  return NextResponse.json({ party });
}
