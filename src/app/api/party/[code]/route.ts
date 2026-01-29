import { NextRequest, NextResponse } from 'next/server';
import { getParty, joinParty, leaveParty } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const party = await getParty(code.toUpperCase());
  
  if (!party) {
    return NextResponse.json({ error: 'Party not found' }, { status: 404 });
  }
  
  return NextResponse.json({ party });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const sessionCookie = request.cookies.get('steam_session');
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const session = JSON.parse(sessionCookie.value);
  
  const party = await joinParty(code.toUpperCase(), {
    odId: session.steamId,
    personaname: session.personaname,
    avatarfull: session.avatarfull,
    gamesLoaded: false,
  });
  
  if (!party) {
    return NextResponse.json({ error: 'Party not found' }, { status: 404 });
  }
  
  return NextResponse.json({ party });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const sessionCookie = request.cookies.get('steam_session');
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const session = JSON.parse(sessionCookie.value);
  await leaveParty(code.toUpperCase(), session.steamId);
  
  return NextResponse.json({ success: true });
}
