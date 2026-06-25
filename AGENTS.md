# AGENTS.md

## Cursor Cloud specific instructions

**Project:** NorCal CARB Mobile operations — static site on **Cloudflare Pages**, agents on **Google Cloud**, command-center UI in Vite + React 19.

### Architecture
- **Sites** → Cloudflare Pages (`sites/norcalcarbmobile/`)
- **Agents** (Mila, Kesha) → Google AI Studio / Google Cloud
- **API** (`api/`) → Google Cloud Functions (Gmail, health)

### Run / build
- Dev server: `npm run dev` (Vite, `0.0.0.0:3000`) — agent UI only
- NorCal site build: `npm run build:norcal`
- NorCal site preview: `cd sites/norcalcarbmobile && npm run preview`
- Production build (command center): `npm run build`
- There are **no lint or automated test scripts** in `package.json`

### Gmail API (`api/gmail/send.ts`, `api/health.ts`)

Deploy to **Google Cloud Functions** — not Cloudflare, not Vercel.

**Set secrets in Google Secret Manager / Cloud Functions env AND Cursor Cloud Agent secrets.**

#### Option A — Service account (Workspace / norcalcarbmobile.com)

1. Google Cloud Console → enable **Gmail API**
2. Create service account → download JSON key
3. Google Workspace Admin → Security → API Controls → Domain-wide delegation → authorize client ID with scope `https://mail.google.com/`
4. Set:
   - `GOOGLE_SERVICE_ACCOUNT_KEY` = full JSON string or path to key file
   - `GOOGLE_IMPERSONATE_USER` = `bryan@norcalcarbmobile.com`

#### Option B — OAuth refresh token (personal Gmail)

1. Google Cloud Console → OAuth 2.0 credentials (Web app)
2. Add redirect URI `http://localhost:3333/oauth2callback`
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then run `npm run gmail:oauth`
4. Set `GOOGLE_REFRESH_TOKEN` from script output

See `.env.example` for all variable names.

### Non-obvious gotchas
- `index.html` must contain `<script type="module" src="/index.tsx"></script>` as the entry point.
- esbuild rejects a bare `>` inside JSX text content. Use `&gt;` or `{'>'}` instead.
- AI features require `GEMINI_API_KEY`. Vite injects it into `process.env.API_KEY` (see `vite.config.ts`). Restart dev server after changing the key.
- Gmail service accounts **cannot** access Gmail without domain-wide delegation + `GOOGLE_IMPERSONATE_USER`.
