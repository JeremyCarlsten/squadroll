import { NextRequest, NextResponse } from 'next/server';
import { getParty, getPlayerGames, storeCommonGames, getCommonGames, getAggregatedGenreVotes } from '@/lib/redis';
import { findCommonMultiplayerGames, extractAllGenres, filterGamesByGenres } from '@/lib/steam';

export async function GET(request: NextRequest) {
  const partyCode = request.nextUrl.searchParams.get('code');
  const includeFiltered = request.nextUrl.searchParams.get('filtered') === 'true';
  
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
  
  // Check if we already calculated common games (cached)
  let commonGames = await getCommonGames(partyCode.toUpperCase());
  
  if (!commonGames) {
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
    
    // Find common games AND filter for multiplayer (includes genres now)
    commonGames = await findCommonMultiplayerGames(allPlayerGames);
    
    // Cache the results
    await storeCommonGames(partyCode.toUpperCase(), commonGames);
  }
  
  // Extract all available genres for voting UI
  const availableGenres = extractAllGenres(commonGames);
  
  // If requested, apply genre filter based on votes
  let filteredGames = commonGames;
  if (includeFiltered) {
    const selectedGenres = getAggregatedGenreVotes(party);
    filteredGames = filterGamesByGenres(commonGames, selectedGenres);
  }
  
  return NextResponse.json({ 
    ready: true,
    commonGames: includeFiltered ? filteredGames : commonGames,
    allGamesCount: commonGames.length,
    filteredCount: filteredGames.length,
    availableGenres,
    votes: party.members.map(m => ({
      odId: m.odId,
      personaname: m.personaname,
      genreVotes: m.genreVotes || [],
    })),
  });
}
