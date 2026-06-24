# AGENTS.md

## Cursor Cloud specific instructions

**Project:** "The Silent Partner" — Vite + React 19 frontend with Vercel serverless API routes under `api/`.

### Run / build
- Dev server: `npm run dev` (Vite, serves on `0.0.0.0:3000`). Frontend only; API routes run on Vercel (`vercel dev` or production deploy).
- Production build: `npm run build`; preview with `npm run preview`.
- API health check (after deploy): `GET /api/health` — reports Gmail + Gemini credential status.
- There are **no lint or automated test scripts** in `package.json`.

### Gmail API credentials (required for `/api/gmail/send`)

The API returns this error until credentials are set:

```
Gmail credentials aren't configured yet. The API needs either:
- GOOGLE_SERVICE_ACCOUNT_KEY (preferred), or
- GOOGLE_CLIENT_ID + GOOGLE_REFRESH_TOKEN
```

**Set these as Cursor Cloud Agent secrets AND Vercel environment variables.**

#### Option A — Service account (Workspace / norcalcarbmobile.com)

1. Google Cloud Console → enable **Gmail API**
2. Create service account → download JSON key
3. Google Workspace Admin → Security → API Controls → Domain-wide delegation → authorize the service account client ID with scope `https://mail.google.com/`
4. Set secrets:
   - `GOOGLE_SERVICE_ACCOUNT_KEY` = full JSON string (single line) or path to key file
   - `GOOGLE_IMPERSONATE_USER` = mailbox to send as (e.g. `bryan@norcalcarbmobile.com`)

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
