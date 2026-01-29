import { Redis } from '@upstash/redis';

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface PartyMember {
  odId: string;
  personaname: string;
  avatarfull: string;
  gamesLoaded: boolean;
  genreVotes?: string[];
}

export interface Party {
  id: string;
  code: string;
  hostSteamId: string;
  members: PartyMember[];
  createdAt: number;
}

const PARTY_TTL = 60 * 60 * 2; // 2 hours

export async function createParty(code: string, hostSteamId: string, hostProfile: PartyMember): Promise<Party> {
  const party: Party = {
    id: code,
    code,
    hostSteamId,
    members: [hostProfile],
    createdAt: Date.now(),
  };
  
  await redis.set(`party:${code}`, JSON.stringify(party), { ex: PARTY_TTL });
  return party;
}

export async function getParty(code: string): Promise<Party | null> {
  const data = await redis.get<string>(`party:${code}`);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function joinParty(code: string, member: PartyMember): Promise<Party | null> {
  const party = await getParty(code);
  if (!party) return null;
  
  // Check if already in party
  if (party.members.some(m => m.odId === member.odId)) {
    return party;
  }
  
  party.members.push(member);
  await redis.set(`party:${code}`, JSON.stringify(party), { ex: PARTY_TTL });
  return party;
}

export async function leaveParty(code: string, steamId: string): Promise<Party | null> {
  const party = await getParty(code);
  if (!party) return null;
  
  party.members = party.members.filter(m => m.odId !== steamId);
  
  if (party.members.length === 0) {
    await redis.del(`party:${code}`);
    return null;
  }
  
  // If host left, assign new host
  if (party.hostSteamId === steamId && party.members.length > 0) {
    party.hostSteamId = party.members[0].odId;
  }
  
  await redis.set(`party:${code}`, JSON.stringify(party), { ex: PARTY_TTL });
  return party;
}

export async function updateMemberGamesLoaded(code: string, steamId: string): Promise<void> {
  const party = await getParty(code);
  if (!party) return;
  
  const member = party.members.find(m => m.odId === steamId);
  if (member) {
    member.gamesLoaded = true;
    await redis.set(`party:${code}`, JSON.stringify(party), { ex: PARTY_TTL });
  }
}

export async function updateMemberGenreVotes(code: string, steamId: string, genres: string[]): Promise<void> {
  const party = await getParty(code);
  if (!party) return;
  
  const member = party.members.find(m => m.odId === steamId);
  if (member) {
    member.genreVotes = genres;
    await redis.set(`party:${code}`, JSON.stringify(party), { ex: PARTY_TTL });
  }
}

// Get aggregated genre votes - genres that got at least one vote
export function getAggregatedGenreVotes(party: Party): string[] {
  const genreSet = new Set<string>();
  for (const member of party.members) {
    if (member.genreVotes) {
      for (const genre of member.genreVotes) {
        genreSet.add(genre);
      }
    }
  }
  return [...genreSet];
}

// Store player's games temporarily
export async function storePlayerGames(steamId: string, partyCode: string, games: { appid: number; name: string }[]): Promise<void> {
  await redis.set(`games:${partyCode}:${steamId}`, JSON.stringify(games), { ex: PARTY_TTL });
}

export async function getPlayerGames(steamId: string, partyCode: string): Promise<{ appid: number; name: string }[] | null> {
  const data = await redis.get<string>(`games:${partyCode}:${steamId}`);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

// Store common multiplayer games with genres (cached after first calculation)
export async function storeCommonGames(partyCode: string, games: { appid: number; name: string; genres: string[] }[]): Promise<void> {
  await redis.set(`common:${partyCode}`, JSON.stringify(games), { ex: PARTY_TTL });
}

export async function getCommonGames(partyCode: string): Promise<{ appid: number; name: string; genres: string[] }[] | null> {
  const data = await redis.get<string>(`common:${partyCode}`);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}
