import { NextRequest, NextResponse } from 'next/server';
import { getMultiplayerGames } from '@/lib/steam';
import { storePlayerGames, updateMemberGamesLoaded } from '@/lib/redis';

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get('steam_session');
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const session = JSON.parse(sessionCookie.value);
  const { partyCode } = await request.json();
  
  if (!partyCode) {
    return NextResponse.json({ error: 'Party code required' }, { status: 400 });
  }
  
  try {
    // Fetch multiplayer games for this user
    const games = await getMultiplayerGames(session.steamId);
    
    // Store in Redis
    await storePlayerGames(
      session.steamId,
      partyCode.toUpperCase(),
      games.map(g => ({ appid: g.appid, name: g.name }))
    );
    
    // Mark as loaded
    await updateMemberGamesLoaded(partyCode.toUpperCase(), session.steamId);
    
    return NextResponse.json({ 
      success: true, 
      gameCount: games.length,
      games: games.slice(0, 10), // Return preview
    });
  } catch (error) {
    console.error('Error loading games:', error);
    return NextResponse.json({ error: 'Failed to load games' }, { status: 500 });
  }
}
