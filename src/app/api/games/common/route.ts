import { NextRequest, NextResponse } from 'next/server';
import { getParty, getPlayerGames } from '@/lib/redis';
import { findCommonMultiplayerGames } from '@/lib/steam';

export async function GET(request: NextRequest) {
  const partyCode = request.nextUrl.searchParams.get('code');
  
  if (!partyCode) {
    return NextResponse.json({ error: 'Party code required' }, { status: 400 });
  }
  
  const party = await getParty(partyCode.toUpperCase());
  if (!party) {
    return NextResponse.json({ error: 'Party not found' }, { status: 404 });
  }
  
  // Check if all members have loaded games
  const allLoaded = party.members.every(m => m.gamesLoaded);
  if (!allLoaded) {
    return NextResponse.json({ 
      ready: false, 
      loaded: party.members.filter(m => m.gamesLoaded).length,
      total: party.members.length,
    });
  }
  
  // Get all players' games
  const allPlayerGames: { appid: number; name: string }[][] = [];
  for (const member of party.members) {
    const games = await getPlayerGames(member.odId, partyCode.toUpperCase());
    if (games) {
      allPlayerGames.push(games);
    }
  }
  
  if (allPlayerGames.length !== party.members.length) {
    return NextResponse.json({ error: 'Missing game data' }, { status: 500 });
  }
  
  // Find common games AND filter for multiplayer
  const commonMultiplayerGames = await findCommonMultiplayerGames(allPlayerGames);
  
  return NextResponse.json({ 
    ready: true,
    commonGames: commonMultiplayerGames,
    count: commonMultiplayerGames.length,
  });
}
