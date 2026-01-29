import { cookies } from 'next/headers';

export interface SteamSession {
  steamId: string;
  personaname: string;
  avatarfull: string;
}

export async function getSession(): Promise<SteamSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('steam_session');
  
  if (!sessionCookie) return null;
  
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}
