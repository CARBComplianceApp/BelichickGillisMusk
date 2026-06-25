<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NorCal CARB Mobile + Agent Command Center

## Architecture

| Layer | Platform | What |
|-------|----------|------|
| **Sites** | Cloudflare Pages | `norcalcarbmobile.com` and related domains |
| **Agents** | Google Cloud / AI Studio | Mila, Kesha, Gemini agents |
| **API** | Google Cloud Functions | Gmail send, health checks (`api/`) |

No Vercel. All public sites live on Cloudflare.

## NorCal site (primary deliverable)

Static site at `sites/norcalcarbmobile/` — migrated from Squarespace with the same fonts and CSS, 27 pages, 47×301 redirects, SEO + AI-search-friendly HTML.

```bash
npm run build:norcal
cd sites/norcalcarbmobile && npm run preview   # http://localhost:4321
```

Deploy to Cloudflare Pages — see [sites/norcalcarbmobile/README.md](sites/norcalcarbmobile/README.md).

## Agent command center (local dev)

1. `npm install`
2. Copy `.env.example` → `.env.local` and set `GEMINI_API_KEY`
3. `npm run dev` — Vite app on `:3000` (Mila, Kesha, deployment console)

Agents run in **Google AI Studio** for development:
https://aistudio.google.com/apps/a0beac81-ff66-46e9-9e6a-95a65ce56137

Gmail API setup: see [AGENTS.md](AGENTS.md).
