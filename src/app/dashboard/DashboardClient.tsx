'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Toast from '@/components/Toast';

interface Session {
  steamId: string;
  personaname: string;
  avatarfull: string;
}

function isValidPartyCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}

export default function DashboardClient({ session }: { session: Session }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const processedErrorRef = useRef<string | null>(null);
  const lastErrorRef = useRef<string>('');
  
  // Check for error in URL params - only process once
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam && errorParam !== processedErrorRef.current) {
      processedErrorRef.current = errorParam;
      
      if (errorParam === 'party_not_found') {
        setError('Party not found');
        setShowToast(true);
        lastErrorRef.current = 'Party not found';
      } else if (errorParam === 'invalid_code') {
        setError('Invalid party code');
        setShowToast(true);
        lastErrorRef.current = 'Invalid party code';
      }
    }
  }, [searchParams]);
  
  const showError = (message: string) => {
    // Only show toast if error message changed
    if (lastErrorRef.current !== message) {
      lastErrorRef.current = message;
      setError(message);
      setShowToast(true);
    } else {
      setError(message);
    }
  };

  const createParty = async () => {
    setLoading(true);
    const res = await fetch('/api/party/create', { method: 'POST' });
    const data = await res.json();
    if (data.party) {
      router.push(`/party/${data.party.code}`);
    }
    setLoading(false);
  };

  const joinParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      showError('Please enter a party code');
      return;
    }
    
    const normalizedCode = joinCode.toUpperCase().trim();
    
    // Validate code format
    if (!isValidPartyCode(normalizedCode)) {
      showError('Invalid party code format');
      return;
    }
    
    setLoading(true);
    setError('');
    setShowToast(false);
    
    const res = await fetch(`/api/party/${normalizedCode}`, { method: 'POST' });
    if (res.ok) {
      router.push(`/party/${normalizedCode}`);
    } else {
      showError('Party not found');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white p-4 sm:p-8 relative">
      <Toast 
        message={error} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
      {/* Ambient glow - hidden on mobile */}
      <div className="hidden sm:block absolute top-0 left-1/3 w-96 h-96 bg-green-500/5 rounded-full blur-[150px]" />
      
      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-black">
            <span className="text-[#39ff14]">SQUAD</span>
            <span className="text-[#ff6b35]">ROLL</span>
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 bg-[#12121a] rounded-full pl-1 pr-2 sm:pr-4 py-1">
              <Image
                src={session.avatarfull}
                alt={session.personaname}
                width={28}
                height={28}
                className="rounded-full ring-2 ring-[#39ff14] sm:w-8 sm:h-8"
              />
              <span className="font-mono text-xs sm:text-sm text-[#39ff14] max-w-[80px] sm:max-w-none truncate">
                {session.personaname}
              </span>
            </div>
            <a
              href="/api/auth/logout"
              className="text-gray-600 hover:text-red-500 text-xs sm:text-sm font-mono"
            >
              [EJECT]
            </a>
          </div>
        </div>

        {/* Main Actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Create Party */}
          <div className="bg-[#12121a] border-2 border-[#39ff14]/20 rounded-2xl p-6 sm:p-10 text-center hover:border-[#39ff14]/50 transition-colors">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🕹️</div>
            <h2 className="text-xl sm:text-2xl font-black text-[#39ff14] mb-2">START A SQUAD</h2>
            <p className="text-gray-500 font-mono text-xs sm:text-sm mb-6 sm:mb-8">
              Create a party and get a code to share
            </p>
            <button
              onClick={createParty}
              disabled={loading}
              className="bg-[#39ff14] hover:bg-[#5fff3f] text-black px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-black text-lg sm:text-xl uppercase tracking-wider transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ boxShadow: '0 0 30px #39ff1440' }}
            >
              {loading ? 'CREATING...' : '🎲 NEW GAME'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 font-mono text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Join Party */}
          <div className="bg-[#12121a] border-2 border-[#ff6b35]/20 rounded-2xl p-6 sm:p-10 text-center hover:border-[#ff6b35]/50 transition-colors">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎫</div>
            <h2 className="text-xl sm:text-2xl font-black text-[#ff6b35] mb-2">JOIN A SQUAD</h2>
            <p className="text-gray-500 font-mono text-xs sm:text-sm mb-6 sm:mb-8">
              Got a code from a friend?
            </p>
            <form onSubmit={joinParty} className="flex gap-2 sm:gap-3 max-w-sm mx-auto">
              <input
                type="text"
                placeholder="CODE"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError('');
                  setShowToast(false);
                  lastErrorRef.current = '';
                }}
                className="flex-1 bg-[#0a0a0f] border-2 border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-center text-xl sm:text-2xl font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase placeholder:text-gray-700 focus:outline-none focus:border-[#ff6b35] transition-colors"
                maxLength={6}
              />
              <button
                type="submit"
                disabled={loading || !joinCode.trim()}
                className="bg-[#ff6b35] hover:bg-[#ff8555] text-black px-6 sm:px-8 py-3 rounded-lg font-bold text-base sm:text-lg transition-colors disabled:opacity-50"
              >
                GO
              </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-3 font-mono">{error}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
