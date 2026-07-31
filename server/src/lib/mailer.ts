import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (config.smtp.dev || !config.smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    });
  }
  return transporter;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ delivered: boolean; preview?: string }> {
  const t = getTransporter();
  if (!t) {
    console.log(`[mail:dev] To: ${opts.to} | ${opts.subject}`);
    return { delivered: false, preview: undefined };
  }
  try {
    await t.sendMail({ from: config.smtp.from, to: opts.to, subject: opts.subject, html: opts.html });
    return { delivered: true };
  } catch (err) {
    console.error('[mail] send failed', err);
    return { delivered: false };
  }
}
