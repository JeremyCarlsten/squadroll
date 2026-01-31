// Steam API utilities

const STEAM_API_KEY = process.env.STEAM_API_KEY!;
const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_STORE_BASE = 'https://store.steampowered.com';

// Use mock data in development if USE_MOCK_STEAM is set, or if no API key is configured
const USE_MOCK_DATA = process.env.USE_MOCK_STEAM === 'true' || 
  (process.env.NODE_ENV === 'development' && !STEAM_API_KEY);

if (USE_MOCK_DATA) {
  console.log('🎮 Using mock Steam API data for development');
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url?: string;
}

export interface GameWithGenres {
  appid: number;
  name: string;
  genres: string[];
}

// ALL multiplayer-related category IDs from Steam
const MULTIPLAYER_CATEGORIES = [
  1,   // Multi-player
  9,   // Co-op
  20,  // MMO
  27,  // Cross-Platform Multiplayer
  36,  // Online Multi-Player
  37,  // Local Multi-Player
  38,  // Online Co-op
  39,  // Local Co-op
  47,  // LAN Co-op
  48,  // LAN PvP
  49,  // PvP
];

// Standardized genre categories for voting
const GENRE_MAP: Record<string, string> = {
  'Action': 'Action',
  'Adventure': 'Adventure',
  'Casual': 'Casual',
  'Indie': 'Indie',
  'Massively Multiplayer': 'MMO',
  'Racing': 'Racing',
  'RPG': 'RPG',
  'Simulation': 'Simulation',
  'Sports': 'Sports',
  'Strategy': 'Strategy',
  'Free to Play': 'Free to Play',
  'Early Access': 'Early Access',
  // Map some common ones
  'Violent': 'Action',
  'Gore': 'Action',
};

export async function getOwnedGames(steamId: string): Promise<SteamGame[]> {
  if (USE_MOCK_DATA) {
    const { getMockOwnedGames } = await import('./mockSteam');
    return getMockOwnedGames(steamId);
  }
  
  const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch owned games');
  
  const data = await res.json();
  return data.response?.games || [];
}

interface StoreGameDetails {
  isMultiplayer: boolean;
  genres: string[];
}

export async function getGameDetailsFromStore(appId: number): Promise<StoreGameDetails | null> {
  if (USE_MOCK_DATA) {
    const { getMockGameDetails } = await import('./mockSteam');
    const mockDetails = getMockGameDetails(appId);
    if (mockDetails) {
      return mockDetails;
    }
    // Return null for unknown games (same as real API)
    return null;
  }
  
  try {
    const url = `${STEAM_STORE_BASE}/api/appdetails?appids=${appId}`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const gameData = data[appId.toString()];
    
    if (!gameData?.success || !gameData.data) {
      return null;
    }
    
    const categories = gameData.data.categories || [];
    const isMultiplayer = categories.some((cat: { id: number }) => 
      MULTIPLAYER_CATEGORIES.includes(cat.id)
    );
    
    // Extract and normalize genres
    const rawGenres = gameData.data.genres || [];
    const genres = rawGenres
      .map((g: { description: string }) => GENRE_MAP[g.description] || g.description)
      .filter((g: string, i: number, arr: string[]) => arr.indexOf(g) === i); // dedupe
    
    return { isMultiplayer, genres };
  } catch {
    return null;
  }
}

// Get all games (no filtering) - filtering happens after finding common games
export async function getAllGames(steamId: string): Promise<SteamGame[]> {
  const games = await getOwnedGames(steamId);
  console.log(`Found ${games.length} owned games for ${steamId}`);
  return games;
}

// Find common games between all players, THEN filter for multiplayer, include genres
export async function findCommonMultiplayerGames(
  allPlayerGames: { appid: number; name: string }[][]
): Promise<GameWithGenres[]> {
  if (allPlayerGames.length === 0) return [];
  
  // Step 1: Find games ALL players own
  const firstPlayerAppIds = new Set(allPlayerGames[0].map(g => g.appid));
  
  const commonAppIds = [...firstPlayerAppIds].filter(appId =>
    allPlayerGames.every(playerGames => 
      playerGames.some(g => g.appid === appId)
    )
  );
  
  // Get game names from first player's list
  const commonGames = allPlayerGames[0]
    .filter(g => commonAppIds.includes(g.appid))
    .map(g => ({ appid: g.appid, name: g.name }));
  
  console.log(`Found ${commonGames.length} common games, checking for multiplayer...`);
  
  // Step 2: Filter to multiplayer and get genres
  const multiplayerGames: GameWithGenres[] = [];
  
  for (const game of commonGames) {
    const details = await getGameDetailsFromStore(game.appid);
    
    // If we can't get details, include it with empty genres (benefit of doubt)
    if (details === null) {
      multiplayerGames.push({ ...game, genres: [] });
    } else if (details.isMultiplayer) {
      multiplayerGames.push({ ...game, genres: details.genres });
    }
    
    // Small delay to be nice to Steam API (skip in mock mode)
    if (!USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`${multiplayerGames.length} of ${commonGames.length} common games are multiplayer`);
  return multiplayerGames.sort((a, b) => a.name.localeCompare(b.name));
}

// Get all unique genres from a list of games
export function extractAllGenres(games: GameWithGenres[]): string[] {
  const genreSet = new Set<string>();
  for (const game of games) {
    for (const genre of game.genres) {
      genreSet.add(genre);
    }
  }
  return [...genreSet].sort();
}

// Filter games by selected genres
export function filterGamesByGenres(games: GameWithGenres[], selectedGenres: string[]): GameWithGenres[] {
  if (selectedGenres.length === 0) return games;
  
  return games.filter(game => 
    // Include if game has ANY of the selected genres, or if game has no genre data
    game.genres.length === 0 || game.genres.some(g => selectedGenres.includes(g))
  );
}

export function pickRandomGame<T>(games: T[]): T | null {
  if (games.length === 0) return null;
  return games[Math.floor(Math.random() * games.length)];
}

// Steam OpenID
export function getSteamLoginUrl(returnUrl: string): string {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnUrl,
    'openid.realm': returnUrl.split('/').slice(0, 3).join('/'),
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });
  
  return `https://steamcommunity.com/openid/login?${params.toString()}`;
}

export function extractSteamIdFromOpenId(claimedId: string): string | null {
  const match = claimedId.match(/\/openid\/id\/(\d+)/);
  return match ? match[1] : null;
}

export async function getSteamProfile(steamId: string) {
  if (USE_MOCK_DATA) {
    const { getMockSteamProfile } = await import('./mockSteam');
    return getMockSteamProfile(steamId);
  }
  
  const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch Steam profile');
  
  const data = await res.json();
  return data.response?.players?.[0] || null;
}
