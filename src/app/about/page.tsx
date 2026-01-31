import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About SquadRoll - The Multiplayer Steam Game Picker',
  description: 'SquadRoll helps friend groups decide what to play by finding multiplayer games everyone owns on Steam and randomly picking one. Stop arguing, start playing.',
  keywords: ['steam game picker', 'multiplayer game picker', 'what to play with friends', 'steam co-op games', 'random game picker'],
};

export default function About() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Header */}
        <Link href="/" className="inline-block mb-12">
          <h1 className="text-3xl font-black">
            <span className="text-[#39ff14]">SQUAD</span>
            <span className="text-[#ff6b35]">ROLL</span>
          </h1>
        </Link>

        <article className="prose prose-invert prose-lg max-w-none">
          <h1 className="text-4xl font-black text-white mb-4">
            Stop Arguing About What Game to Play
          </h1>
          
          <p className="text-xl text-gray-400 mb-8">
            We&apos;ve all been there. You and your friends hop on Discord, ready for game night. 
            Then comes the question that kills the vibe: <em>&quot;What should we play?&quot;</em>
          </p>

          <p className="text-gray-300">
            30 minutes later, you&apos;re still scrolling through Steam libraries, trying to remember 
            which games everyone owns, which ones support multiplayer, and which ones you haven&apos;t 
            already played to death.
          </p>

          <h2 className="text-2xl font-bold text-[#39ff14] mt-12 mb-4">
            SquadRoll Solves This
          </h2>

          <p className="text-gray-300">
            SquadRoll connects to everyone&apos;s Steam library, finds the multiplayer games you 
            <strong> all</strong> own, and picks one at random. It&apos;s that simple.
          </p>

          <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6 my-8">
            <h3 className="text-xl font-bold text-white mb-4">How it works:</h3>
            <ol className="text-gray-300 space-y-3">
              <li><span className="text-[#39ff14] font-bold">1.</span> Sign in with Steam (we only see your games)</li>
              <li><span className="text-[#39ff14] font-bold">2.</span> Create a party and share the code</li>
              <li><span className="text-[#39ff14] font-bold">3.</span> Everyone joins and loads their library</li>
              <li><span className="text-[#39ff14] font-bold">4.</span> Vote on what genre you&apos;re feeling (optional)</li>
              <li><span className="text-[#39ff14] font-bold">5.</span> Hit ROLL and let fate decide</li>
            </ol>
          </div>

          <h2 className="text-2xl font-bold text-[#ff6b35] mt-12 mb-4">
            Why Random?
          </h2>

          <p className="text-gray-300">
            Random is fair. No one person dominates the choice. No one feels like they&apos;re 
            always giving in. And sometimes you rediscover a gem you forgot you owned.
          </p>

          <p className="text-gray-300">
            Plus, it&apos;s just fun. The slot machine anticipation, the reveal, the collective 
            reaction — it turns a tedious decision into a mini-game itself.
          </p>

          <h2 className="text-2xl font-bold text-[#ffd700] mt-12 mb-4">
            Features
          </h2>

          <ul className="text-gray-300 space-y-2">
            <li>🎮 <strong>Steam Integration</strong> — Secure login via Steam OpenID</li>
            <li>👥 <strong>Party System</strong> — Simple 6-character codes to join</li>
            <li>🎯 <strong>Multiplayer Filter</strong> — Only shows games you can actually play together</li>
            <li>🗳️ <strong>Genre Voting</strong> — Narrow it down by mood (Action? Strategy? Casual?)</li>
            <li>🎲 <strong>Fun Reveal</strong> — Slot machine style animation for the pick</li>
            <li>🚀 <strong>Quick Launch</strong> — Direct link to start the game in Steam</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">
            Free & Private
          </h2>

          <p className="text-gray-300">
            SquadRoll is free to use. We don&apos;t store your Steam data permanently — libraries 
            are cached temporarily for your session and then deleted. We don&apos;t see your password 
            (Steam handles authentication), and we don&apos;t sell your data.
          </p>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-block bg-[#39ff14] hover:bg-[#5fff3f] text-black px-8 py-4 rounded-xl font-black text-xl transition-all hover:scale-105"
            >
              🎲 Try SquadRoll Now
            </Link>
          </div>

          <hr className="border-gray-800 my-12" />

          <p className="text-gray-500 text-sm">
            Built by <a href="https://lonesilolabs.com" className="text-[#39ff14] hover:underline">Lone Silo Labs</a>. 
            Questions? Issues? <a href="https://github.com/JeremyCarlsten/squadroll" className="text-[#39ff14] hover:underline">GitHub</a>
          </p>
        </article>
      </div>
    </main>
  );
}
