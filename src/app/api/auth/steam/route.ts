import { NextRequest, NextResponse } from 'next/server';
import { getSteamLoginUrl } from '@/lib/steam';

const USE_MOCK_DATA = process.env.USE_MOCK_STEAM === 'true' || 
  (process.env.NODE_ENV === 'development' && !process.env.STEAM_API_KEY);

function isValidPartyCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const joinCode = request.nextUrl.searchParams.get('join');
  
  // In mock mode, skip Steam login and assign one of 3 mock users
  if (USE_MOCK_DATA) {
    const { getRandomMockUser } = await import('@/lib/mockSteam');
    const mockUser = getRandomMockUser();
    
    const callbackUrl = new URL(`${appUrl}/api/auth/steam/callback`);
    callbackUrl.searchParams.set('openid.mode', 'id_res');
    callbackUrl.searchParams.set('openid.claimed_id', `http://specs.openid.net/auth/2.0/identifier_select`);
    callbackUrl.searchParams.set('mock_steamid', mockUser.steamid);
    if (joinCode && isValidPartyCode(joinCode)) {
      callbackUrl.searchParams.set('join', joinCode.toUpperCase());
    }
    return NextResponse.redirect(callbackUrl.toString());
  }
  
  // Include join code in return URL if provided and valid
  const callbackUrl = new URL(`${appUrl}/api/auth/steam/callback`);
  if (joinCode && isValidPartyCode(joinCode)) {
    callbackUrl.searchParams.set('join', joinCode.toUpperCase());
  } else if (joinCode) {
    // Invalid code format - redirect to home with error
    return NextResponse.redirect(`${appUrl}?error=invalid_code`);
  }
  
  const loginUrl = getSteamLoginUrl(callbackUrl.toString());
  
  return NextResponse.redirect(loginUrl);
}
