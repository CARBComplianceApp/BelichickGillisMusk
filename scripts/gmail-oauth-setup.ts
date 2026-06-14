/**
 * One-time OAuth helper to obtain GOOGLE_REFRESH_TOKEN.
 *
 * Usage:
 *   1. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local
 *   2. npx tsx scripts/gmail-oauth-setup.ts
 *   3. Open the printed URL, sign in, paste the auth code when prompted
 *   4. Copy the refresh token into GOOGLE_REFRESH_TOKEN
 */
import http from 'http';
import { URL } from 'url';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3333/oauth2callback';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before running this script.');
  process.exit(1);
}

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

console.log('\nOpen this URL in your browser:\n');
console.log(authUrl);
console.log('\nWaiting for OAuth callback on', REDIRECT_URI, '...\n');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:3333`);

  if (url.pathname !== '/oauth2callback') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400);
    res.end('Missing code');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Success</h1><p>You can close this tab. Check the terminal for your refresh token.</p>');

    console.log('\n✅ OAuth success. Add these to your environment:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    if (tokens.access_token) {
      console.log(`# access token (expires): ${tokens.access_token.slice(0, 20)}...`);
    }
    console.log('');
  } catch (error) {
    res.writeHead(500);
    res.end('Token exchange failed');
    console.error('Token exchange failed:', error);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(3333, () => {
  console.log('OAuth callback server listening on http://localhost:3333');
});
