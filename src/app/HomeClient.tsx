'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '@/components/Toast';

function isValidPartyCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}

function UrlHandler({ 
  onError, 
  onJoinCode,
  onShowToast
}: { 
  onError: (error: string) => void;
  onJoinCode: (code: string) => void;
  onShowToast: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedErrorRef = useRef<string | null>(null);
  
  useEffect(() => {
    const joinParam = searchParams.get('join');
    const errorParam = searchParams.get('error');
    
    if (errorParam && errorParam !== processedErrorRef.current) {
      processedErrorRef.current = errorParam;
      
      if (errorParam === 'party_not_found') {
        onError('Party not found');
        onShowToast();
      } else if (errorParam === 'invalid_code') {
        onError('Invalid party code');
        onShowToast();
      } else if (errorParam === 'auth_failed') {
        onError('Authentication failed');
        onShowToast();
      }
    }
    
    if (joinParam) {
      if (isValidPartyCode(joinParam)) {
        router.push(`/api/auth/steam?join=${joinParam.toUpperCase()}`);
      } else {
        if (processedErrorRef.current !== 'invalid_code') {
          processedErrorRef.current = 'invalid_code';
          router.replace('/?error=invalid_code');
          onError('Invalid party code');
          onShowToast();
        }
      }
    }
  }, [searchParams, router, onError, onJoinCode, onShowToast]);
  
  return null;
}

export default function HomeClient() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const lastErrorRef = useRef<string>('');

  const showError = (message: string) => {
    if (lastErrorRef.current !== message) {
      lastErrorRef.current = message;
      setError(message);
      setShowToast(true);
    } else {
      setError(message);
    }
  };

  const handleJoinParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      showError('Please enter a party code');
      return;
    }
    
    const normalizedCode = joinCode.toUpperCase().trim();
    
    if (!isValidPartyCode(normalizedCode)) {
      showError('Invalid party code format');
      return;
    }
    
    const res = await fetch(`/api/party/${normalizedCode}`);
    if (res.ok) {
      router.push(`/api/auth/steam?join=${normalizedCode}`);
    } else {
      showError('Party not found');
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <Toast 
        message={error} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
      <Suspense fallback={null}>
        <UrlHandler 
          onError={setError} 
          onJoinCode={setJoinCode}
          onShowToast={() => setShowToast(true)}
        />
      </Suspense>
      
      {/* Ambient glow effects - hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-20 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
      <div className="hidden sm:block absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 py-8 sm:py-16 relative">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Logo - Neon Sign Style */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-block relative">
              <span className="text-4xl sm:text-6xl">🎲</span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight">
                <span className="text-[#39ff14] neon-text neon-flicker">SQUAD</span>
                <span className="text-[#ff6b35] neon-text">ROLL</span>
              </h1>
            </div>
            <p className="text-base sm:text-xl text-gray-400 mt-4 sm:mt-6 font-mono px-4">
              &gt; &quot;What should we play?&quot;_<span className="animate-pulse">|</span>
            </p>
          </div>

          {/* How it works - Arcade Cabinet Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-8 sm:my-16 px-2">
            <div className="bg-[#12121a] border-2 border-[#39ff14]/30 rounded-lg p-4 sm:p-6 hover:border-[#39ff14] transition-colors group">
              <div className="text-3xl sm:text-5xl mb-2 sm:mb-4 group-hover:dice-bounce">🔌</div>
              <h3 className="font-bold text-[#39ff14] text-base sm:text-lg mb-1 sm:mb-2">PLUG IN</h3>
              <p className="text-gray-500 text-xs sm:text-sm font-mono">
                Steam login. We peek at your games. That&apos;s it.
              </p>
            </div>
            <div className="bg-[#12121a] border-2 border-[#ff6b35]/30 rounded-lg p-4 sm:p-6 hover:border-[#ff6b35] transition-colors group">
              <div className="text-3xl sm:text-5xl mb-2 sm:mb-4 group-hover:dice-bounce">👾</div>
              <h3 className="font-bold text-[#ff6b35] text-base sm:text-lg mb-1 sm:mb-2">SQUAD UP</h3>
              <p className="text-gray-500 text-xs sm:text-sm font-mono">
                Create party. Share code. Friends join.
              </p>
            </div>
            <div className="bg-[#12121a] border-2 border-[#ffd700]/30 rounded-lg p-4 sm:p-6 hover:border-[#ffd700] transition-colors group">
              <div className="text-3xl sm:text-5xl mb-2 sm:mb-4 group-hover:dice-bounce">🎰</div>
              <h3 className="font-bold text-[#ffd700] text-base sm:text-lg mb-1 sm:mb-2">ROLL IT</h3>
              <p className="text-gray-500 text-xs sm:text-sm font-mono">
                We find your shared games. Fate picks one.
              </p>
            </div>
          </div>

          {/* CTA - Big Arcade Button */}
          <div className="space-y-6 sm:space-y-8 px-4">
            <a
              href="/api/auth/steam"
              className="inline-block bg-[#12121a] border-3 sm:border-4 border-[#39ff14] text-[#39ff14] px-6 sm:px-12 py-4 sm:py-5 rounded-xl font-black text-lg sm:text-2xl uppercase tracking-wider hover:bg-[#39ff14] hover:text-black transition-all hover:scale-105 neon-flicker"
              style={{ boxShadow: '0 0 20px #39ff14, 0 0 40px #39ff1440, inset 0 0 20px #39ff1420' }}
            >
              🎮 Sign in with Steam
            </a>

            {/* Join existing party */}
            <div className="pt-6 sm:pt-8 border-t border-gray-800">
              <p className="text-gray-500 mb-3 sm:mb-4 font-mono text-xs sm:text-sm">GOT A CODE?</p>
              <form onSubmit={handleJoinParty} className="flex gap-2 sm:gap-3 max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="XXXXXX"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setError('');
                    setShowToast(false);
                    lastErrorRef.current = '';
                  }}
                  className="flex-1 bg-[#12121a] border-2 border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-center text-lg sm:text-xl font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase placeholder:text-gray-700 focus:outline-none focus:border-[#ff6b35] transition-colors"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="bg-[#ff6b35] hover:bg-[#ff8555] text-black px-5 sm:px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  JOIN
                </button>
              </form>
              {error && <p className="text-red-500 text-sm mt-2 font-mono">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
