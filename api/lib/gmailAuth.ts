import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { JWT } from 'google-auth-library';
import fs from 'fs';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
];

export interface GmailCredentialStatus {
  configured: boolean;
  method?: 'service_account' | 'oauth';
  error?: string;
  setupInstructions?: string[];
}

export interface ServiceAccountKey {
  type?: string;
  project_id?: string;
  private_key?: string;
  client_email?: string;
  client_id?: string;
}

function parseServiceAccountKey(raw: string): ServiceAccountKey {
  const trimmed = raw.trim();

  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed) as ServiceAccountKey;
  }

  if (fs.existsSync(trimmed)) {
    return JSON.parse(fs.readFileSync(trimmed, 'utf8')) as ServiceAccountKey;
  }

  throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY must be JSON or a path to a JSON key file');
}

export function getGmailCredentialStatus(): GmailCredentialStatus {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim();
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

  if (serviceAccountKey) {
    try {
      const key = parseServiceAccountKey(serviceAccountKey);
      if (!key.client_email || !key.private_key) {
        return {
          configured: false,
          error: 'GOOGLE_SERVICE_ACCOUNT_KEY is missing client_email or private_key',
          setupInstructions: getSetupInstructions(),
        };
      }

      return { configured: true, method: 'service_account' };
    } catch (error) {
      return {
        configured: false,
        error: `Invalid GOOGLE_SERVICE_ACCOUNT_KEY: ${error instanceof Error ? error.message : 'parse error'}`,
        setupInstructions: getSetupInstructions(),
      };
    }
  }

  if (clientId && refreshToken) {
    if (!process.env.GOOGLE_CLIENT_SECRET?.trim()) {
      return {
        configured: false,
        error: 'GOOGLE_CLIENT_SECRET is required when using OAuth (GOOGLE_CLIENT_ID + GOOGLE_REFRESH_TOKEN)',
        setupInstructions: getSetupInstructions(),
      };
    }

    return { configured: true, method: 'oauth' };
  }

  if (clientId || refreshToken) {
    return {
      configured: false,
      error: 'Incomplete OAuth credentials: both GOOGLE_CLIENT_ID and GOOGLE_REFRESH_TOKEN are required',
      setupInstructions: getSetupInstructions(),
    };
  }

  return {
    configured: false,
    error: [
      "Gmail credentials aren't configured yet. The API needs either:",
      '- GOOGLE_SERVICE_ACCOUNT_KEY (preferred), or',
      '- GOOGLE_CLIENT_ID + GOOGLE_REFRESH_TOKEN',
    ].join('\n'),
    setupInstructions: getSetupInstructions(),
  };
}

export function getSetupInstructions(): string[] {
  return [
    'Option A (preferred): Service account with domain-wide delegation',
    '1. Enable Gmail API in Google Cloud Console',
    '2. Create a service account and download the JSON key',
    '3. In Google Workspace Admin: Security → API Controls → Domain-wide delegation',
    '4. Authorize the service account client ID with scope https://mail.google.com/',
    '5. Set GOOGLE_SERVICE_ACCOUNT_KEY to the full JSON (or file path)',
    '6. Set GOOGLE_IMPERSONATE_USER to the mailbox to send as (e.g. bryan@norcalcarbmobile.com)',
    '',
    'Option B: OAuth refresh token (personal Gmail or non-Workspace)',
    '1. Create OAuth 2.0 credentials (Web application) in Google Cloud Console',
    '2. Add redirect URI http://localhost:3000/oauth2callback',
    '3. Run the OAuth consent flow once to obtain a refresh token',
    '4. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN',
  ];
}

export async function getGmailClient(): Promise<gmail_v1.Gmail> {
  const status = getGmailCredentialStatus();
  if (!status.configured) {
    throw new Error(status.error);
  }

  if (status.method === 'service_account') {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!.trim();
    const key = parseServiceAccountKey(raw);
    const impersonateUser = process.env.GOOGLE_IMPERSONATE_USER?.trim();

    if (!impersonateUser) {
      throw new Error(
        'GOOGLE_IMPERSONATE_USER is required for service account Gmail access (e.g. bryan@norcalcarbmobile.com)'
      );
    }

    const auth = new JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: GMAIL_SCOPES,
      subject: impersonateUser,
    });

    return google.gmail({ version: 'v1', auth });
  }

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export function buildRawEmail(options: {
  to: string;
  subject: string;
  body: string;
  from?: string;
}): string {
  const from = options.from || process.env.GMAIL_FROM || process.env.GOOGLE_IMPERSONATE_USER || 'me';
  const lines = [
    `From: ${from}`,
    `To: ${options.to}`,
    `Subject: ${options.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    options.body,
  ];

  return Buffer.from(lines.join('\r\n')).toString('base64url');
}
