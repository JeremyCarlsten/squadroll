import { NextResponse } from 'next/server';
import { getSteamLoginUrl } from '@/lib/steam';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const returnUrl = `${appUrl}/api/auth/steam/callback`;
  const loginUrl = getSteamLoginUrl(returnUrl);
  
  return NextResponse.redirect(loginUrl);
}
