'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PartyMember {
  odId: string;
  personaname: string;
  avatarfull: string;
  gamesLoaded: boolean;
  genreVotes?: string[];
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
  genres: string[];
}

interface VoteInfo {
  odId: string;
  personaname: string;
  genreVotes: string[];
}

// Genre emoji mapping for fun
const GENRE_EMOJI: Record<string, string> = {
  'Action': '💥',
  'Adventure': '🗺️',
  'Casual': '😎',
  'Indie': '🎨',
  'MMO': '🌍',
  'Racing': '🏎️',
  'RPG': '⚔️',
  'Simulation': '🎛️',
  'Sports': '⚽',
  'Strategy': '🧠',
  'Free to Play': '🆓',
  'Early Access': '🚧',
};

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
  const [myGamesLoaded, setMyGamesLoaded] = useState(
    initialParty.members.find(m => m.odId === session.steamId)?.gamesLoaded || false
  );
  const [commonGames, setCommonGames] = useState<Game[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [allReady, setAllReady] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [rolling, setRolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Genre voting state
  const [myGenreVotes, setMyGenreVotes] = useState<string[]>([]);
  const [allVotes, setAllVotes] = useState<VoteInfo[]>([]);
  const [filteredCount, setFilteredCount] = useState(0);

  // Poll for party updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/party/${party.code}`);
      if (res.ok) {
        const data = await res.json();
        setParty(data.party);
        
        // Update my loaded status from party
        const me = data.party.members.find((m: PartyMember) => m.odId === session.steamId);
        if (me?.gamesLoaded) setMyGamesLoaded(true);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [party.code, session.steamId]);

  // Check for common games
  const checkCommonGames = useCallback(async (includeFiltered = false) => {
    const res = await fetch(`/api/games/common?code=${party.code}&filtered=${includeFiltered}`);
    const data = await res.json();
    
    if (data.ready) {
      setAllReady(true);
      setCommonGames(data.commonGames);
      setAvailableGenres(data.availableGenres || []);
      setAllVotes(data.votes || []);
      setFilteredCount(data.filteredCount || data.commonGames.length);
    }
  }, [party.code]);

  useEffect(() => {
    if (party.members.every(m => m.gamesLoaded)) {
      checkCommonGames();
    }
  }, [party.members, checkCommonGames]);

  // Poll for vote updates when in voting phase
  useEffect(() => {
    if (!allReady) return;
    
    const interval = setInterval(() => {
      checkCommonGames(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [allReady, checkCommonGames]);

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

  const toggleGenreVote = async (genre: string) => {
    const newVotes = myGenreVotes.includes(genre)
      ? myGenreVotes.filter(g => g !== genre)
      : [...myGenreVotes, genre];
    
    setMyGenreVotes(newVotes);
    
    // Send vote to server
    await fetch('/api/games/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partyCode: party.code, genres: newVotes }),
    });
    
    // Refresh filtered count
    checkCommonGames(true);
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

  const rollGame = async () => {
    // Get filtered games based on votes
    const res = await fetch(`/api/games/common?code=${party.code}&filtered=true`);
    const data = await res.json();
    const gamesToRoll = data.commonGames || commonGames;
    
    if (gamesToRoll.length === 0) return;
    
    setRolling(true);
    setSelectedGame(null);
    setShowConfetti(false);
    
    // Slot machine style spin
    let count = 0;
    const maxCount = 25;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * gamesToRoll.length);
      setSelectedGame(gamesToRoll[randomIdx]);
      count++;
      
      if (count >= maxCount) {
        clearInterval(interval);
        setRolling(false);
        const finalIdx = Math.floor(Math.random() * gamesToRoll.length);
        setSelectedGame(gamesToRoll[finalIdx]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 80 + count * 5);
  };

  // Get all genres that have at least one vote
  const getVotedGenres = () => {
    const genres = new Set<string>();
    for (const vote of allVotes) {
      for (const g of vote.genreVotes) {
        genres.add(g);
      }
    }
    return genres;
  };

  const votedGenres = getVotedGenres();

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white p-6 relative overflow-hidden">
      {/* Ambient effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[200px]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[200px]" />
      
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                fontSize: '24px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🎮', '🎲', '🎰', '🕹️', '⭐', '🎯'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">
            <span className="text-[#39ff14]">SQUAD</span>
            <span className="text-[#ff6b35]">ROLL</span>
          </h1>
          <button
            onClick={leaveParty}
            className="text-gray-600 hover:text-red-500 text-sm font-mono"
          >
            [LEAVE]
          </button>
        </div>

        {/* Party Code Display */}
        <div className="bg-[#12121a] border-2 border-[#ffd700]/30 rounded-xl p-6 mb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffd700]/5 to-transparent" />
          <p className="text-gray-500 font-mono text-xs mb-2">PARTY CODE</p>
          <button
            onClick={copyCode}
            className="text-5xl font-black tracking-[0.4em] text-[#ffd700] hover:scale-105 transition-transform neon-flicker"
            style={{ textShadow: '0 0 20px #ffd700, 0 0 40px #ffd70050' }}
          >
            {party.code}
          </button>
          <p className="text-xs text-gray-600 mt-2 font-mono">
            {copied ? '✓ COPIED!' : 'CLICK TO COPY'}
          </p>
        </div>

        {/* Squad Members */}
        <div className="bg-[#12121a] border border-gray-800 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-mono text-gray-500 mb-4">SQUAD [{party.members.length}]</h2>
          <div className="grid gap-2">
            {party.members.map((member) => (
              <div
                key={member.odId}
                className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                  member.gamesLoaded 
                    ? 'bg-[#39ff14]/10 border border-[#39ff14]/30' 
                    : 'bg-[#0a0a0f] border border-gray-800'
                }`}
              >
                <Image
                  src={member.avatarfull}
                  alt={member.personaname}
                  width={40}
                  height={40}
                  className={`rounded-full ring-2 ${member.gamesLoaded ? 'ring-[#39ff14]' : 'ring-gray-700'}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm truncate">
                    {member.personaname}
                    {member.odId === party.hostSteamId && (
                      <span className="ml-2 text-[10px] bg-[#ff6b35] text-black px-1.5 py-0.5 rounded font-bold">
                        HOST
                      </span>
                    )}
                    {member.odId === session.steamId && (
                      <span className="ml-2 text-gray-600 text-xs">(you)</span>
                    )}
                  </div>
                  {/* Show member's genre votes */}
                  {allReady && member.gamesLoaded && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(allVotes.find(v => v.odId === member.odId)?.genreVotes || []).map(g => (
                        <span key={g} className="text-xs bg-[#39ff14]/20 text-[#39ff14] px-1.5 py-0.5 rounded">
                          {GENRE_EMOJI[g] || '🎮'} {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs font-mono">
                  {member.gamesLoaded ? (
                    <span className="text-[#39ff14]">✓ READY</span>
                  ) : (
                    <span className="text-yellow-500 animate-pulse">LOADING...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load Games Button */}
        {!myGamesLoaded && (
          <div className="bg-[#12121a] border-2 border-blue-500/30 rounded-xl p-8 mb-6 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-black text-blue-400 mb-2">LOAD YOUR LIBRARY</h2>
            <p className="text-gray-500 font-mono text-sm mb-6">
              Scanning for multiplayer games...
            </p>
            <button
              onClick={loadMyGames}
              disabled={loadingGames}
              className="bg-blue-500 hover:bg-blue-400 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50"
              style={{ boxShadow: '0 0 20px #3b82f640' }}
            >
              {loadingGames ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚙️</span> SCANNING...
                </span>
              ) : (
                '🎮 SCAN GAMES'
              )}
            </button>
          </div>
        )}

        {/* Waiting for others */}
        {myGamesLoaded && !allReady && (
          <div className="bg-[#12121a] border border-gray-800 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4 animate-bounce">⏳</div>
            <h2 className="text-xl font-black text-gray-400 mb-2">WAITING FOR SQUAD</h2>
            <div className="flex justify-center gap-2 mt-4">
              {party.members.map((m) => (
                <div
                  key={m.odId}
                  className={`w-3 h-3 rounded-full ${
                    m.gamesLoaded ? 'bg-[#39ff14]' : 'bg-gray-700 animate-pulse'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600 font-mono text-sm mt-4">
              {party.members.filter(m => m.gamesLoaded).length} / {party.members.length} ready
            </p>
          </div>
        )}

        {/* Genre Voting & Roll Zone */}
        {allReady && (
          <div className="space-y-6">
            {commonGames.length === 0 ? (
              <div className="bg-[#12121a] border-2 border-red-500/30 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">💀</div>
                <h2 className="text-2xl font-black text-red-500 mb-2">NO MATCHES</h2>
                <p className="text-gray-500 font-mono">
                  Your squad doesn&apos;t share any multiplayer games.<br/>
                  Time for a Steam sale.
                </p>
              </div>
            ) : (
              <>
                {/* Genre Voting */}
                {availableGenres.length > 0 && (
                  <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-mono text-gray-500">WHAT ARE YOU FEELING?</h2>
                      <span className="text-xs text-gray-600 font-mono">
                        {votedGenres.size > 0 
                          ? `${filteredCount} games match` 
                          : `${commonGames.length} games total`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableGenres.map((genre) => {
                        const isSelected = myGenreVotes.includes(genre);
                        const hasAnyVote = votedGenres.has(genre);
                        
                        return (
                          <button
                            key={genre}
                            onClick={() => toggleGenreVote(genre)}
                            className={`px-3 py-2 rounded-lg font-mono text-sm transition-all ${
                              isSelected
                                ? 'bg-[#39ff14] text-black'
                                : hasAnyVote
                                ? 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/50'
                                : 'bg-[#0a0a0f] text-gray-400 border border-gray-700 hover:border-gray-500'
                            }`}
                          >
                            {GENRE_EMOJI[genre] || '🎮'} {genre}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-600 mt-3 font-mono">
                      Pick genres you&apos;re in the mood for, or leave blank to roll all
                    </p>
                  </div>
                )}

                {/* Roll Section */}
                <div className="bg-[#12121a] border-2 border-[#39ff14]/30 rounded-2xl p-8 text-center">
                  <div className="text-gray-500 font-mono text-sm mb-2">
                    {votedGenres.size > 0 
                      ? `ROLLING FROM ${filteredCount} GAMES`
                      : `${commonGames.length} GAMES IN COMMON`}
                  </div>

                  {/* Selected Game Display */}
                  {selectedGame && (
                    <div className={`my-6 p-6 rounded-xl ${rolling ? 'bg-[#0a0a0f]' : 'bg-gradient-to-br from-[#39ff14]/20 to-[#ff6b35]/20'} ${!rolling && 'celebrate'}`}>
                      <div className={`text-3xl font-black ${rolling ? 'text-gray-400' : 'text-white'}`}>
                        {selectedGame.name}
                      </div>
                      {!rolling && selectedGame.genres.length > 0 && (
                        <div className="flex gap-2 justify-center mt-2 flex-wrap">
                          {selectedGame.genres.map(g => (
                            <span key={g} className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded">
                              {GENRE_EMOJI[g] || '🎮'} {g}
                            </span>
                          ))}
                        </div>
                      )}
                      {!rolling && (
                        <a
                          href={`steam://run/${selectedGame.appid}`}
                          className="inline-flex items-center gap-2 mt-4 bg-[#39ff14] hover:bg-[#5fff3f] text-black px-6 py-3 rounded-lg font-bold transition-all hover:scale-105"
                        >
                          🚀 LAUNCH GAME
                        </a>
                      )}
                    </div>
                  )}

                  {/* The Big Roll Button */}
                  <button
                    onClick={rollGame}
                    disabled={rolling || (votedGenres.size > 0 && filteredCount === 0)}
                    className={`relative px-16 py-8 rounded-2xl font-black text-3xl uppercase tracking-wider transition-all ${
                      rolling 
                        ? 'bg-gray-800 text-gray-500' 
                        : 'bg-gradient-to-r from-[#39ff14] to-[#ff6b35] text-black hover:scale-105'
                    } disabled:opacity-50`}
                    style={!rolling ? { boxShadow: '0 0 40px #39ff1450, 0 0 80px #ff6b3530' } : {}}
                  >
                    {rolling ? (
                      <span className="flex items-center gap-3">
                        <span className="slot-spin inline-block">🎰</span>
                        ROLLING...
                      </span>
                    ) : (
                      '🎲 ROLL!'
                    )}
                  </button>

                  {/* Game List */}
                  <details className="mt-8 text-left">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-400 font-mono text-sm">
                      View all {commonGames.length} games
                    </summary>
                    <div className="mt-4 max-h-48 overflow-y-auto bg-[#0a0a0f] rounded-lg p-4">
                      <ul className="space-y-1 font-mono text-xs">
                        {commonGames.map((game) => (
                          <li key={game.appid} className="text-gray-500 hover:text-gray-300 flex items-center gap-2">
                            <span>{game.name}</span>
                            {game.genres.length > 0 && (
                              <span className="text-gray-700">
                                ({game.genres.map(g => GENRE_EMOJI[g] || '🎮').join('')})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
