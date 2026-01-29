// Steam API utilities

const STEAM_API_KEY = process.env.STEAM_API_KEY!;
const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_STORE_BASE = 'https://store.steampowered.com';

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url?: string;
}

export interface GameDetails {
  appid: number;
  name: string;
  isMultiplayer: boolean;
  headerImage?: string;
  categories?: { id: number; description: string }[];
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

export async function getOwnedGames(steamId: string): Promise<SteamGame[]> {
  const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch owned games');
  
  const data = await res.json();
  return data.response?.games || [];
}

export async function checkIfMultiplayer(appId: number): Promise<boolean> {
  try {
    const url = `${STEAM_STORE_BASE}/api/appdetails?appids=${appId}`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    
    if (!res.ok) return true; // If we can't check, assume it might be multiplayer
    
    const data = await res.json();
    const gameData = data[appId.toString()];
    
    if (!gameData?.success || !gameData.data) {
      return true; // Can't verify, include it
    }
    
    const categories = gameData.data.categories || [];
    return categories.some((cat: { id: number }) => 
      MULTIPLAYER_CATEGORIES.includes(cat.id)
    );
  } catch {
    return true; // On error, include the game
  }
}

// Get all games (no filtering) - filtering happens after finding common games
export async function getAllGames(steamId: string): Promise<SteamGame[]> {
  const games = await getOwnedGames(steamId);
  console.log(`Found ${games.length} owned games for ${steamId}`);
  return games;
}

// Find common games between all players, THEN filter for multiplayer
export async function findCommonMultiplayerGames(
  allPlayerGames: { appid: number; name: string }[][]
): Promise<{ appid: number; name: string }[]> {
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
  
  // Step 2: Filter to multiplayer only (much smaller list to check!)
  const multiplayerGames: { appid: number; name: string }[] = [];
  
  for (const game of commonGames) {
    const isMultiplayer = await checkIfMultiplayer(game.appid);
    if (isMultiplayer) {
      multiplayerGames.push(game);
    }
    // Small delay to be nice to Steam API
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`${multiplayerGames.length} of ${commonGames.length} common games are multiplayer`);
  return multiplayerGames.sort((a, b) => a.name.localeCompare(b.name));
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
  const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch Steam profile');
  
  const data = await res.json();
  return data.response?.players?.[0] || null;
}
