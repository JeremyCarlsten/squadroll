'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const handleJoinParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    const res = await fetch(`/api/party/${joinCode}`);
    if (res.ok) {
      router.push(`/api/auth/steam?join=${joinCode.toUpperCase()}`);
    } else {
      setError('Party not found');
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Logo - Neon Sign Style */}
          <div className="mb-12">
            <div className="inline-block relative">
              {/* Dice icons */}
              <span className="text-6xl">🎲</span>
              <h1 className="text-7xl font-black tracking-tight">
                <span className="text-[#39ff14] neon-text neon-flicker">SQUAD</span>
                <span className="text-[#ff6b35] neon-text">ROLL</span>
              </h1>
            </div>
            <p className="text-xl text-gray-400 mt-6 font-mono">
              &gt; &quot;What should we play?&quot;_<span className="animate-pulse">|</span>
            </p>
          </div>

          {/* How it works - Arcade Cabinet Style */}
          <div className="grid md:grid-cols-3 gap-4 my-16">
            <div className="bg-[#12121a] border-2 border-[#39ff14]/30 rounded-lg p-6 hover:border-[#39ff14] transition-colors group">
              <div className="text-5xl mb-4 group-hover:dice-bounce">🔌</div>
              <h3 className="font-bold text-[#39ff14] text-lg mb-2">PLUG IN</h3>
              <p className="text-gray-500 text-sm font-mono">
                Steam login. We peek at your games. That&apos;s it.
              </p>
            </div>
            <div className="bg-[#12121a] border-2 border-[#ff6b35]/30 rounded-lg p-6 hover:border-[#ff6b35] transition-colors group">
              <div className="text-5xl mb-4 group-hover:dice-bounce">👾</div>
              <h3 className="font-bold text-[#ff6b35] text-lg mb-2">SQUAD UP</h3>
              <p className="text-gray-500 text-sm font-mono">
                Create party. Share code. Friends join.
              </p>
            </div>
            <div className="bg-[#12121a] border-2 border-[#ffd700]/30 rounded-lg p-6 hover:border-[#ffd700] transition-colors group">
              <div className="text-5xl mb-4 group-hover:dice-bounce">🎰</div>
              <h3 className="font-bold text-[#ffd700] text-lg mb-2">ROLL IT</h3>
              <p className="text-gray-500 text-sm font-mono">
                We find your shared games. Fate picks one.
              </p>
            </div>
          </div>

          {/* CTA - Big Arcade Button */}
          <div className="space-y-8">
            <a
              href="/api/auth/steam"
              className="inline-block bg-[#12121a] border-4 border-[#39ff14] text-[#39ff14] px-12 py-5 rounded-xl font-black text-2xl uppercase tracking-wider hover:bg-[#39ff14] hover:text-black transition-all hover:scale-105 neon-flicker"
              style={{ boxShadow: '0 0 20px #39ff14, 0 0 40px #39ff1440, inset 0 0 20px #39ff1420' }}
            >
              🎮 Sign in with Steam
            </a>

            {/* Join existing party */}
            <div className="pt-8 border-t border-gray-800">
              <p className="text-gray-500 mb-4 font-mono text-sm">GOT A CODE?</p>
              <form onSubmit={handleJoinParty} className="flex gap-3 max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="XXXXXX"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className="flex-1 bg-[#12121a] border-2 border-gray-700 rounded-lg px-4 py-3 text-center text-xl font-mono tracking-[0.3em] uppercase placeholder:text-gray-700 focus:outline-none focus:border-[#ff6b35] transition-colors"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="bg-[#ff6b35] hover:bg-[#ff8555] text-black px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  JOIN
                </button>
              </form>
              {error && <p className="text-red-500 text-sm mt-2 font-mono">{error}</p>}
            </div>
          </div>

          {/* Footer tagline */}
          <div className="mt-20 text-gray-700 font-mono text-xs">
            NO MORE ARGUMENTS. JUST GAMES.
          </div>
        </div>
      </div>
    </main>
  );
}
