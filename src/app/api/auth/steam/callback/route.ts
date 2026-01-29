import { NextRequest, NextResponse } from 'next/server';
import { extractSteamIdFromOpenId, getSteamProfile } from '@/lib/steam';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
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
  
  const steamId = extractSteamIdFromOpenId(claimedId);
  if (!steamId) {
    return NextResponse.redirect(`${appUrl}?error=invalid_steam_id`);
  }
  
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
    
    const response = NextResponse.redirect(`${appUrl}/dashboard`);
    response.cookies.set('steam_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(`${appUrl}?error=auth_error`);
  }
}
