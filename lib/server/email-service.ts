import 'server-only';

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const AWS_REGION = process.env.AWS_REGION || '';
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || '';

let sesClient: SESClient | null = null;

function getSesClient() {
  if (sesClient) return sesClient;
  sesClient = new SESClient({ region: AWS_REGION });
  return sesClient;
}

function isConfigured() {
  return Boolean(AWS_REGION && SES_FROM_EMAIL);
}

export async function sendTransactionalEmail(payload: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}) {
  if (!isConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('SES is not configured. Skipping email send.');
    }
    return { success: false as const, skipped: true as const };
  }

  try {
    const client = getSesClient();
    await client.send(
      new SendEmailCommand({
        Source: SES_FROM_EMAIL,
        Destination: { ToAddresses: [payload.to] },
        Message: {
          Subject: { Data: payload.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: payload.htmlBody, Charset: 'UTF-8' },
            Text: { Data: payload.textBody, Charset: 'UTF-8' },
          },
        },
      })
    );
    return { success: true as const };
  } catch (error) {
    console.error('Failed to send SES email', error);
    return { success: false as const, skipped: false as const };
  }
}

