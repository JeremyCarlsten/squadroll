import { NextRequest, NextResponse } from 'next/server';
import { getSteamLoginUrl } from '@/lib/steam';

function isValidPartyCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const joinCode = request.nextUrl.searchParams.get('join');
  
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
