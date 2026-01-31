// Mock Steam API data for local development - 3 predefined users

export interface MockSteamProfile {
  steamid: string
  personaname: string
  avatarfull: string
}

export interface MockSteamGame {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url?: string
}

export interface MockGameDetails {
  isMultiplayer: boolean
  genres: string[]
}

// Game data with genres
interface GameData {
  appid: number
  name: string
  genres: string[]
}

// Common games that ALL 3 users have (at least 3 with different categories)
const COMMON_GAMES: GameData[] = [
  { appid: 730, name: 'Counter-Strike 2', genres: ['Action', 'Free to Play'] },
  { appid: 1174180, name: 'Red Dead Redemption 2', genres: ['Action', 'Adventure'] },
  { appid: 1086940, name: 'Baldur\'s Gate 3', genres: ['foo', 'Strategy'] },
  { appid: 271590, name: 'Grand Theft Auto V', genres: ['Action', 'Adventure'] },
  { appid: 570, name: 'Dota 2', genres: ['Action', 'Free to Play', 'Strategy'] },
]

// User 1's additional games
const USER1_GAMES: GameData[] = [
  { appid: 1245620, name: 'ELDEN RING', genres: ['Action', 'foo'] },
  { appid: 1599340, name: 'Lethal Company', genres: ['Action', 'Adventure', 'Indie'] },
  { appid: 1091500, name: 'Cyberpunk 2077', genres: ['Action', 'foo'] },
  { appid: 440, name: 'Team Fortress 2', genres: ['Action', 'Free to Play'] },
  { appid: 381210, name: 'Dead by Daylight', genres: ['Action', 'Adventure', 'Indie'] },
]

// User 2's additional games
const USER2_GAMES: GameData[] = [
  { appid: 1938090, name: 'Call of Duty', genres: ['Action'] },
  { appid: 252490, name: 'Rust', genres: ['Action', 'Adventure', 'Indie', 'Simulation'] },
  { appid: 1091500, name: 'Cyberpunk 2077', genres: ['Action', 'foo'] },
  { appid: 1245620, name: 'ELDEN RING', genres: ['Action', 'foo'] },
  { appid: 1599340, name: 'Lethal Company', genres: ['Action', 'Adventure', 'Indie'] },
]

// User 3's additional games
const USER3_GAMES: GameData[] = [
  { appid: 1086940, name: 'Baldur\'s Gate 3', genres: ['foo', 'Strategy'] },
  { appid: 1091500, name: 'Cyberpunk 2077', genres: ['Action', 'foo'] },
  { appid: 381210, name: 'Dead by Daylight', genres: ['Action', 'Adventure', 'Indie'] },
  { appid: 252490, name: 'Rust', genres: ['Action', 'Adventure', 'Indie', 'Simulation'] },
  { appid: 440, name: 'Team Fortress 2', genres: ['Action', 'Free to Play'] },
]

// 3 predefined mock users
export const MOCK_USERS = [
  {
    steamid: '76561198000000001',
    personaname: 'GamerPro99',
    avatarfull: 'https://avatars.steamstatic.com/1a2b3c4d5e6f7g8h9i0j_default.jpg',
    games: [...COMMON_GAMES, ...USER1_GAMES],
  },
  {
    steamid: '76561198000000002',
    personaname: 'SteamMaster',
    avatarfull: 'https://avatars.steamstatic.com/2b3c4d5e6f7g8h9i0j1k_default.jpg',
    games: [...COMMON_GAMES, ...USER2_GAMES],
  },
  {
    steamid: '76561198000000003',
    personaname: 'GameWizard',
    avatarfull: 'https://avatars.steamstatic.com/3c4d5e6f7g8h9i0j1k2l_default.jpg',
    games: [...COMMON_GAMES, ...USER3_GAMES],
  },
]

// Get a mock user by steamId
export function getMockUserBySteamId(steamId: string) {
  return MOCK_USERS.find(u => u.steamid === steamId) || MOCK_USERS[0]
}

// Get a random mock user (for new logins)
export function getRandomMockUser() {
  const index = Math.floor(Math.random() * MOCK_USERS.length)
  return MOCK_USERS[index]
}

// Get mock profile
export function getMockSteamProfile(steamId: string): MockSteamProfile {
  const user = getMockUserBySteamId(steamId)
  return {
    steamid: user.steamid,
    personaname: user.personaname,
    avatarfull: user.avatarfull,
  }
}

// Get mock games
export function getMockOwnedGames(steamId: string): MockSteamGame[] {
  const user = getMockUserBySteamId(steamId)
  
  return user.games.map(game => ({
    appid: game.appid,
    name: game.name,
    playtime_forever: Math.floor(Math.random() * 1000) + 10,
    img_icon_url: `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/icon.jpg`,
  }))
}

// Get mock game details from store
export function getMockGameDetails(appId: number): MockGameDetails | null {
  // Check all users' games to find the game
  const allGames = [
    ...COMMON_GAMES,
    ...USER1_GAMES,
    ...USER2_GAMES,
    ...USER3_GAMES,
  ]
  
  const game = allGames.find(g => g.appid === appId)
  
  if (!game) {
    return null
  }
  
  // All our mock games are multiplayer
  return {
    isMultiplayer: true,
    genres: game.genres,
  }
}
