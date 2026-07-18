import { getGmailCredentialStatus } from './lib/gmailAuth';
import { sendJson, type HttpHandler } from './lib/http';

export const health: HttpHandler = (_req, res) => {
  const gmail = getGmailCredentialStatus();

  sendJson(res, 200, {
    ok: true,
    service: 'norcal-api',
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
};

export default health;
