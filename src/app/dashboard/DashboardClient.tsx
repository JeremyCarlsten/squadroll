'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Session {
  steamId: string;
  personaname: string;
  avatarfull: string;
}

export default function DashboardClient({ session }: { session: Session }) {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (!joinCode.trim()) return;
    
    setLoading(true);
    setError('');
    
    const res = await fetch(`/api/party/${joinCode}`, { method: 'POST' });
    if (res.ok) {
      router.push(`/party/${joinCode.toUpperCase()}`);
    } else {
      setError('Party not found');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold">🎮 SquadRoll</h1>
          <div className="flex items-center gap-4">
            <Image
              src={session.avatarfull}
              alt={session.personaname}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-medium">{session.personaname}</span>
            <a
              href="/api/auth/logout"
              className="text-gray-400 hover:text-white text-sm"
            >
              Logout
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-8">
          {/* Create Party */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Start a Squad</h2>
            <p className="text-gray-400 mb-6">
              Create a party and invite your friends to join
            </p>
            <button
              onClick={createParty}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-4 rounded-xl font-bold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Creating...' : '🎉 Create Party'}
            </button>
          </div>

          {/* Join Party */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Join a Squad</h2>
            <p className="text-gray-400 mb-6">
              Got a code? Enter it below
            </p>
            <form onSubmit={joinParty} className="flex gap-3 max-w-sm mx-auto">
              <input
                type="text"
                placeholder="CODE"
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
                disabled={loading || !joinCode.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Join
              </button>
            </form>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
