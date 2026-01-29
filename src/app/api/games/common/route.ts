import { NextRequest, NextResponse } from 'next/server';
import { getParty, getPlayerGames } from '@/lib/redis';

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
  const allGames: { appid: number; name: string }[][] = [];
  for (const member of party.members) {
    const games = await getPlayerGames(member.odId, partyCode.toUpperCase());
    if (games) {
      allGames.push(games);
    }
  }
  
  if (allGames.length !== party.members.length) {
    return NextResponse.json({ error: 'Missing game data' }, { status: 500 });
  }
  
  // Find common games
  const firstPlayerAppIds = new Set(allGames[0].map(g => g.appid));
  const commonAppIds = [...firstPlayerAppIds].filter(appId =>
    allGames.every(games => games.some(g => g.appid === appId))
  );
  
  const commonGames = allGames[0]
    .filter(g => commonAppIds.includes(g.appid))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  return NextResponse.json({ 
    ready: true,
    commonGames,
    count: commonGames.length,
  });
}
