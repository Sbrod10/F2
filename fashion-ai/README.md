# StyleAI — AI-Powered Fashion Discovery

An AI-powered fashion discovery platform built with Node.js, Express, and Claude AI. Find your perfect style using filters, environment scanning, and AI chat — then compare prices across 12+ retailers.

## Features

- **AI Style Filters** — Select occasion, aesthetic, colors, budget, season, body type. Claude AI generates 4 complete outfit recommendations with styling tips.
- **Environment Scan** — Upload a photo of your destination. AI detects the setting (beach, office, wedding, etc.) and recommends perfect outfits for that context.
- **AI Chat** — Talk to StyleAI about anything fashion. Get styling advice, find alternatives, ask about trends.
- **Price Comparison** — Every recommended item is searched across 12+ retailers (ASOS, Zara, H&M, Nordstrom, etc.) with deals, ratings, and direct links.
- **User Accounts** — Register, log in, save outfits and items to your profile.
- **Machine Learning** — The AI records your search history, style preferences, and saved items. Every new recommendation includes your personalization context, making results more accurate over time.

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with trending items |
| Discover | `/discover.html` | Filters + Environment Scan + AI Chat |
| Results | `/results.html` | Price comparison across retailers |
| Account | `/account.html` | Sign in / Register |
| Profile | `/profile.html` | Saved outfits, AI insights, preferences |

## Setup

```bash
cd fashion-ai

# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Add your Anthropic API key to .env
# ANTHROPIC_API_KEY=sk-ant-...

# 4. Start the server
npm start
# or for development with auto-reload:
npm run dev

# 5. Open http://localhost:3000
```

## Environment Variables

```
ANTHROPIC_API_KEY=your_key_here     # Required for AI features
JWT_SECRET=change_this_in_prod      # Required for auth
PORT=3000                           # Optional, defaults to 3000
```

Get your Anthropic API key at: https://console.anthropic.com

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/ai/recommend` | AI outfit recommendations |
| POST | `/api/ai/scan-environment` | Analyze photo for fashion |
| POST | `/api/ai/analyze-outfit` | Rate an outfit from photo |
| POST | `/api/ai/style-chat` | AI style chat |
| POST | `/api/search/prices` | Price comparison across retailers |
| GET  | `/api/search/trending` | Trending fashion items |
| GET  | `/api/user/profile` | Get user profile + stats |
| PUT  | `/api/user/preferences` | Update style preferences |
| POST | `/api/user/save-item` | Save/unsave item |
| POST | `/api/user/save-outfit` | Save outfit to profile |
| GET  | `/api/user/insights` | ML-based style insights |

## Tech Stack

- **Backend**: Node.js + Express
- **AI**: Claude API (`claude-opus-4-8` for vision, `claude-sonnet-4-6` for chat)
- **Auth**: JWT + bcrypt
- **Frontend**: Vanilla JS + CSS (no framework dependencies)
- **Storage**: In-memory (extend with PostgreSQL or MongoDB for production)

## Extending for Production

- Replace in-memory `users` Map in `routes/auth.js` with a real database
- Add Redis for session management
- Integrate a real price search API (SerpAPI, Amazon PA API, etc.)
- Add image CDN for environment scan uploads
- Deploy to Vercel, Railway, or AWS
