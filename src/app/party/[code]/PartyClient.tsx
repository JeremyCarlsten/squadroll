'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PartyMember {
  odId: string;
  personaname: string;
  avatarfull: string;
  gamesLoaded: boolean;
}

interface Party {
  id: string;
  code: string;
  hostSteamId: string;
  members: PartyMember[];
}

interface Session {
  steamId: string;
  personaname: string;
  avatarfull: string;
}

interface Game {
  appid: number;
  name: string;
}

export default function PartyClient({ 
  initialParty, 
  session 
}: { 
  initialParty: Party;
  session: Session;
}) {
  const router = useRouter();
  const [party, setParty] = useState(initialParty);
  const [loadingGames, setLoadingGames] = useState(false);
  const [myGamesLoaded, setMyGamesLoaded] = useState(false);
  const [commonGames, setCommonGames] = useState<Game[]>([]);
  const [allReady, setAllReady] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [rolling, setRolling] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHost = party.hostSteamId === session.steamId;

  // Poll for party updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/party/${party.code}`);
      if (res.ok) {
        const data = await res.json();
        setParty(data.party);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [party.code]);

  // Check for common games when all members loaded
  const checkCommonGames = useCallback(async () => {
    const res = await fetch(`/api/games/common?code=${party.code}`);
    const data = await res.json();
    
    if (data.ready) {
      setAllReady(true);
      setCommonGames(data.commonGames);
    }
  }, [party.code]);

  useEffect(() => {
    if (party.members.every(m => m.gamesLoaded)) {
      checkCommonGames();
    }
  }, [party.members, checkCommonGames]);

  const loadMyGames = async () => {
    setLoadingGames(true);
    const res = await fetch('/api/games/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partyCode: party.code }),
    });
    
    if (res.ok) {
      setMyGamesLoaded(true);
    }
    setLoadingGames(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(party.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveParty = async () => {
    await fetch(`/api/party/${party.code}`, { method: 'DELETE' });
    router.push('/dashboard');
  };

  const rollGame = () => {
    if (commonGames.length === 0) return;
    
    setRolling(true);
    setSelectedGame(null);
    
    // Animate through games
    let count = 0;
    const maxCount = 20;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * commonGames.length);
      setSelectedGame(commonGames[randomIdx]);
      count++;
      
      if (count >= maxCount) {
        clearInterval(interval);
        setRolling(false);
        // Final pick
        const finalIdx = Math.floor(Math.random() * commonGames.length);
        setSelectedGame(commonGames[finalIdx]);
      }
    }, 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">🎮 SquadRoll</h1>
          <button
            onClick={leaveParty}
            className="text-gray-400 hover:text-red-400 text-sm"
          >
            Leave Party
          </button>
        </div>

        {/* Party Code */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-6 mb-8 text-center">
          <p className="text-gray-400 mb-2">Party Code</p>
          <button
            onClick={copyCode}
            className="text-5xl font-mono font-bold tracking-[0.3em] hover:text-purple-400 transition-colors"
          >
            {party.code}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            {copied ? '✓ Copied!' : 'Click to copy'}
          </p>
        </div>

        {/* Members */}
        <div className="bg-white/5 backdrop-blur rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Squad ({party.members.length})</h2>
          <div className="space-y-3">
            {party.members.map((member) => (
              <div
                key={member.odId}
                className="flex items-center gap-4 bg-white/5 rounded-xl p-3"
              >
                <Image
                  src={member.avatarfull}
                  alt={member.personaname}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {member.personaname}
                    {member.odId === party.hostSteamId && (
                      <span className="ml-2 text-xs bg-purple-600 px-2 py-0.5 rounded">
                        HOST
                      </span>
                    )}
                    {member.odId === session.steamId && (
                      <span className="ml-2 text-xs text-gray-400">(you)</span>
                    )}
                  </div>
                </div>
                <div>
                  {member.gamesLoaded ? (
                    <span className="text-green-400">✓ Ready</span>
                  ) : (
                    <span className="text-yellow-400">Loading...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load Games / Status */}
        {!myGamesLoaded && (
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 mb-8 text-center">
            <h2 className="text-xl font-bold mb-4">Load Your Games</h2>
            <p className="text-gray-400 mb-6">
              We&apos;ll scan your Steam library for multiplayer games
            </p>
            <button
              onClick={loadMyGames}
              disabled={loadingGames}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              {loadingGames ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Scanning Library...
                </>
              ) : (
                '📚 Load My Games'
              )}
            </button>
          </div>
        )}

        {/* Roll Section */}
        {allReady && (
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 text-center">
            {commonGames.length === 0 ? (
              <>
                <div className="text-6xl mb-4">😢</div>
                <h2 className="text-2xl font-bold mb-4">No Common Games Found</h2>
                <p className="text-gray-400">
                  Your squad doesn&apos;t share any multiplayer games on Steam.
                  Time to do some shopping!
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">
                  🎲 {commonGames.length} Games in Common!
                </h2>
                <p className="text-gray-400 mb-6">
                  Ready to decide what to play?
                </p>

                {/* Selected Game Display */}
                {selectedGame && (
                  <div className={`bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 mb-6 transition-all ${rolling ? 'animate-pulse' : ''}`}>
                    <div className="text-4xl font-bold">
                      {selectedGame.name}
                    </div>
                    {!rolling && (
                      <a
                        href={`steam://run/${selectedGame.appid}`}
                        className="inline-block mt-4 bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        🚀 Launch Game
                      </a>
                    )}
                  </div>
                )}

                <button
                  onClick={rollGame}
                  disabled={rolling}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-12 py-6 rounded-2xl font-bold text-2xl transition-all hover:scale-105 disabled:opacity-70"
                >
                  {rolling ? '🎰 Rolling...' : '🎲 ROLL!'}
                </button>

                {/* Game List */}
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-gray-400 hover:text-white">
                    View all {commonGames.length} games
                  </summary>
                  <div className="mt-4 max-h-64 overflow-y-auto bg-black/20 rounded-xl p-4">
                    <ul className="space-y-1 text-sm">
                      {commonGames.map((game) => (
                        <li key={game.appid} className="text-gray-300">
                          {game.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </>
            )}
          </div>
        )}

        {/* Waiting state */}
        {myGamesLoaded && !allReady && (
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 text-center">
            <div className="animate-bounce text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-bold mb-2">Waiting for Squad</h2>
            <p className="text-gray-400">
              {party.members.filter(m => m.gamesLoaded).length} of {party.members.length} players ready
            </p>
          </div>
        )}
      </div>

      {/* Future ad slot */}
      <div className="fixed bottom-4 right-4 w-64 h-16 opacity-0">
        {/* Ad placeholder */}
      </div>
    </main>
  );
}
