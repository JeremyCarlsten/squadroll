// Steam API utilities

const STEAM_API_KEY = process.env.STEAM_API_KEY!;
const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_STORE_BASE = 'https://store.steampowered.com';

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url?: string;
  has_community_visible_stats?: boolean;
}

export interface GameDetails {
  appid: number;
  name: string;
  isMultiplayer: boolean;
  headerImage?: string;
  categories?: { id: number; description: string }[];
}

// Multiplayer category IDs from Steam
const MULTIPLAYER_CATEGORIES = [
  1,   // Multi-player
  9,   // Co-op
  27,  // Cross-Platform Multiplayer
  36,  // Online Multi-Player
  37,  // Local Multi-Player
  38,  // Online Co-op
  39,  // Local Co-op
  49,  // PvP
];

export async function getOwnedGames(steamId: string): Promise<SteamGame[]> {
  const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch owned games');
  
  const data = await res.json();
  return data.response?.games || [];
}

export async function getGameDetails(appId: number): Promise<GameDetails | null> {
  try {
    const url = `${STEAM_STORE_BASE}/api/appdetails?appids=${appId}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    
    const data = await res.json();
    const gameData = data[appId.toString()];
    
    if (!gameData?.success || !gameData.data) return null;
    
    const categories = gameData.data.categories || [];
    const isMultiplayer = categories.some((cat: { id: number }) => 
      MULTIPLAYER_CATEGORIES.includes(cat.id)
    );
    
    return {
      appid: appId,
      name: gameData.data.name,
      isMultiplayer,
      headerImage: gameData.data.header_image,
      categories,
    };
  } catch {
    return null;
  }
}

export async function getMultiplayerGames(steamId: string): Promise<GameDetails[]> {
  const ownedGames = await getOwnedGames(steamId);
  const multiplayerGames: GameDetails[] = [];
  
  // Process in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < ownedGames.length; i += batchSize) {
    const batch = ownedGames.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(game => getGameDetails(game.appid))
    );
    
    for (const result of results) {
      if (result?.isMultiplayer) {
        multiplayerGames.push(result);
      }
    }
    
    // Small delay between batches
    if (i + batchSize < ownedGames.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return multiplayerGames;
}

export function findCommonGames(playerGames: GameDetails[][]): GameDetails[] {
  if (playerGames.length === 0) return [];
  if (playerGames.length === 1) return playerGames[0];
  
  // Find games that exist in all players' libraries
  const firstPlayerAppIds = new Set(playerGames[0].map(g => g.appid));
  
  const commonAppIds = [...firstPlayerAppIds].filter(appId =>
    playerGames.every(games => games.some(g => g.appid === appId))
  );
  
  // Return full game details from first player's list
  return playerGames[0].filter(g => commonAppIds.includes(g.appid));
}

export function pickRandomGame(games: GameDetails[]): GameDetails | null {
  if (games.length === 0) return null;
  const index = Math.floor(Math.random() * games.length);
  return games[index];
}

// Steam OpenID URLs
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
