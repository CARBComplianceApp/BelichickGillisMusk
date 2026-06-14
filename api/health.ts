import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGmailCredentialStatus } from './lib/gmailAuth';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const gmail = getGmailCredentialStatus();

  res.status(200).json({
    ok: true,
    service: 'gillis-api',
    gmail: {
      configured: gmail.configured,
      method: gmail.method ?? null,
      error: gmail.error ?? null,
      setupInstructions: gmail.configured ? undefined : gmail.setupInstructions,
    },
    gemini: {
      configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    },
  });
}
