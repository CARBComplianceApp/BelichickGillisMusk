# AGENTS.md

## Cursor Cloud specific instructions

**Project:** "The Silent Partner" — a frontend-only Vite + React 19 + TypeScript single-page app (AI Studio export). There is no backend service; styling is via the Tailwind CDN script in `index.html`.

### Run / build
- Dev server: `npm run dev` (Vite, serves on `0.0.0.0:3000`). This is the primary way to develop/run the app.
- Production build: `npm run build`; preview with `npm run preview`.
- There are **no lint or automated test scripts** in `package.json`. There is no typecheck step in the build pipeline (Vite uses esbuild, not `tsc`).

### Non-obvious gotchas
- `index.html` must contain `<script type="module" src="/index.tsx"></script>` as the entry point. AI Studio injects this at runtime, but local Vite does not, so without it the page renders a **blank/black screen** with an empty `#root` (and `npm run build` only transforms ~2 modules instead of the full app). This entry script is committed on the setup branch.
- esbuild rejects a bare `>` inside JSX text content (`The character '>' is not valid inside a JSX element`). Use `&gt;` or `{'>'}` instead. Once the entry script loads the app, any such occurrence becomes a hard build error / red error overlay, not a warning.
- AI features (Mila chat, Asset Strategy analysis, Kesha voice, Creative Lab image gen, Maps search) call the Gemini API via `@google/genai` and require a `GEMINI_API_KEY` env var. Vite injects it at build/dev time into `process.env.API_KEY` / `process.env.GEMINI_API_KEY` (see `vite.config.ts`), so the dev server must be **restarted** after setting/changing the key. Without the key these views still load but return graceful error text ("Neural Link disrupted"). Core UI (Command Center dashboard, Lead Database with its client-side search filter, sidebar navigation) works fully without any key.
