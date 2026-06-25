import { buildRawEmail, getGmailClient, getGmailCredentialStatus } from '../lib/gmailAuth';
import { readJsonBody, sendJson, type HttpHandler } from '../lib/http';

export const send: HttpHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const status = getGmailCredentialStatus();
  if (!status.configured) {
    return sendJson(res, 503, {
      error: status.error,
      setupInstructions: status.setupInstructions,
    });
  }

  const { to, subject, body } = await readJsonBody<{ to?: string; subject?: string; body?: string }>(req);

  if (!to || !subject || !body) {
    return sendJson(res, 400, {
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

    return sendJson(res, 200, {
      ok: true,
      messageId: result.data.id,
      threadId: result.data.threadId,
    });
  } catch (error) {
    console.error('[Gmail] send failed:', error);
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Failed to send email',
    });
  }
};

export default send;
