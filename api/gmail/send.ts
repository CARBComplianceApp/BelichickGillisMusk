import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildRawEmail, getGmailClient, getGmailCredentialStatus } from '../lib/gmailAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const status = getGmailCredentialStatus();
  if (!status.configured) {
    return res.status(503).json({
      error: status.error,
      setupInstructions: status.setupInstructions,
    });
  }

  const { to, subject, body } = req.body ?? {};

  if (!to || !subject || !body) {
    return res.status(400).json({
      error: 'Missing required fields: to, subject, body',
    });
  }

  try {
    const gmail = await getGmailClient();
    const raw = buildRawEmail({ to, subject, body });

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    return res.status(200).json({
      ok: true,
      messageId: result.data.id,
      threadId: result.data.threadId,
    });
  } catch (error) {
    console.error('[Gmail] send failed:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send email',
    });
  }
}
