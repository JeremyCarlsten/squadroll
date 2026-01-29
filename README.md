# 🎮 SquadRoll

**"What should we play tonight?" — solved forever.**

SquadRoll finds multiplayer games that everyone in your party owns on Steam, then randomly picks one for you.

## Features

- **Steam Login** - Quick OpenID auth, no passwords
- **Party System** - Create/join with 6-character codes
- **Game Matching** - Finds multiplayer games common to ALL players
- **Random Pick** - Fun rolling animation to pick tonight's game
- **Launch Game** - Direct `steam://` link to start playing

## Tech Stack

- **Next.js 15** - App Router, Server Components
- **Tailwind CSS** - Styling
- **Upstash Redis** - Party sessions (free tier: 10k req/day)
- **Steam API** - Game libraries + OpenID auth
- **Vercel** - Deployment (free tier)

## Setup

1. **Clone and install**
   ```bash
   git clone <repo>
   cd squadroll
   npm install
   ```

2. **Get API keys**
   - Steam API Key: https://steamcommunity.com/dev/apikey
   - Upstash Redis: https://upstash.com (create free account)

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your keys in `.env.local`

4. **Run locally**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Environment Variables

| Variable | Description |
|----------|-------------|
| `STEAM_API_KEY` | Steam Web API key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `NEXT_PUBLIC_APP_URL` | Your app URL (for OAuth callback) |

## Future Ideas

- [ ] Ad integration for monetization
- [ ] Game filtering (by genre, playtime, etc.)
- [ ] Reroll with exclusions
- [ ] Party history
- [ ] Discord bot integration
- [ ] Game recommendations

## License

MIT
