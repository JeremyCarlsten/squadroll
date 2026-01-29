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
    
    // Check if party exists
    const res = await fetch(`/api/party/${joinCode}`);
    if (res.ok) {
      // Party exists, redirect to login with party code
      router.push(`/api/auth/steam?join=${joinCode.toUpperCase()}`);
    } else {
      setError('Party not found');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              🎮 SquadRoll
            </h1>
            <p className="text-xl text-gray-300 mt-4">
              &quot;What should we play tonight?&quot; — solved forever.
            </p>
          </div>

          {/* How it works */}
          <div className="grid md:grid-cols-3 gap-6 my-16">
            <div className="bg-white/5 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="font-semibold text-lg mb-2">Sign in with Steam</h3>
              <p className="text-gray-400 text-sm">
                Quick login with Steam OpenID. We only see your games and profile.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="font-semibold text-lg mb-2">Create a Party</h3>
              <p className="text-gray-400 text-sm">
                Get a code. Share it with friends. Everyone joins.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="font-semibold text-lg mb-2">Roll for a Game</h3>
              <p className="text-gray-400 text-sm">
                We find multiplayer games you ALL own, then pick one at random.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-6">
            <a
              href="/api/auth/steam"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-8 py-4 rounded-xl font-bold text-xl transition-all hover:scale-105 shadow-lg shadow-green-900/50"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95 0-5.52-4.48-10-10-10z"/>
              </svg>
              Sign in with Steam
            </a>

            {/* Join Party */}
            <div className="text-gray-400">or join an existing party</div>
            <form onSubmit={handleJoinParty} className="flex gap-3 max-w-sm mx-auto">
              <input
                type="text"
                placeholder="Enter party code"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError('');
                }}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-center text-xl font-mono tracking-widest uppercase placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={6}
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Join
              </button>
            </form>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </div>
      </div>

      {/* Ad placeholder - subtle for future monetization */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-600">
        {/* Ad slot placeholder */}
      </div>
    </main>
  );
}
