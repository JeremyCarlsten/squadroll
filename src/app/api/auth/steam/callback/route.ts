import { NextRequest, NextResponse } from 'next/server';
import { extractSteamIdFromOpenId, getSteamProfile } from '@/lib/steam';
import { getParty } from '@/lib/redis';

function isValidPartyCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const USE_MOCK_DATA = process.env.USE_MOCK_STEAM === 'true' || 
    (process.env.NODE_ENV === 'development' && !process.env.STEAM_API_KEY);
  
  let steamId: string | null = null;
  
  // Handle mock mode
  if (USE_MOCK_DATA) {
    const mockSteamId = searchParams.get('mock_steamid');
    if (mockSteamId) {
      steamId = mockSteamId;
    }
  } else {
    // Verify OpenID response
    const mode = searchParams.get('openid.mode');
    if (mode !== 'id_res') {
      return NextResponse.redirect(`${appUrl}?error=auth_failed`);
    }
    
    // Extract Steam ID from claimed_id
    const claimedId = searchParams.get('openid.claimed_id');
    if (!claimedId) {
      return NextResponse.redirect(`${appUrl}?error=no_claimed_id`);
    }
    
    steamId = extractSteamIdFromOpenId(claimedId);
  }
  
  if (!steamId) {
    return NextResponse.redirect(`${appUrl}?error=invalid_steam_id`);
  }
  
  // Get join code from return URL if present
  const joinCode = searchParams.get('join');
  
  // Get user profile
  try {
    const profile = await getSteamProfile(steamId);
    if (!profile) {
      return NextResponse.redirect(`${appUrl}?error=profile_not_found`);
    }
    
    // Set session cookie with Steam info
    const sessionData = {
      steamId,
      personaname: profile.personaname,
      avatarfull: profile.avatarfull,
    };
    
    // Validate join code if provided
    let redirectUrl = `${appUrl}/dashboard`;
    if (joinCode) {
      const normalizedCode = joinCode.toUpperCase();
      if (isValidPartyCode(normalizedCode)) {
        // Verify party exists before redirecting
        const party = await getParty(normalizedCode);
        if (party) {
          redirectUrl = `${appUrl}/party/${normalizedCode}`;
        } else {
          redirectUrl = `${appUrl}/dashboard?error=party_not_found`;
        }
      } else {
        redirectUrl = `${appUrl}/dashboard?error=invalid_code`;
      }
    }
    
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('steam_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(`${appUrl}?error=auth_error`);
  }
}
