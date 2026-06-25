<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://aistudio.google.com/apps/a0beac81-ff66-46e9-9e6a-95a65ce56137?showPreview=true&showAssistant=true&project=gen-lang-client-0013150741

Production domain: https://silverbackai.agency (redirects to AI Studio)

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set:
   - `GEMINI_API_KEY` — Gemini API key for Mila/Kesha AI features
   - Gmail credentials (see [AGENTS.md](AGENTS.md)) if using `/api/gmail/send`
3. Run the app:
   `npm run dev`
4. Deploy API + frontend to Vercel:
   `vercel --prod`
   Check Gmail status: `GET /api/health`
