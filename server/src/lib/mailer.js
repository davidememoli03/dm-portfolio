import nodemailer from 'nodemailer';

import { config } from '../config.js';

const enabled = Boolean(config.mailer.host && config.mailer.to);

let transporter = null;
if (enabled) {
  transporter = nodemailer.createTransport({
    host: config.mailer.host,
    port: config.mailer.port,
    secure: config.mailer.port === 465,
    auth:
      config.mailer.user && config.mailer.password
        ? { user: config.mailer.user, pass: config.mailer.password }
        : undefined,
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHtml(message) {
  const adminLink = config.mailer.adminUrl
    ? `<p><a href="${escapeHtml(config.mailer.adminUrl)}">Open admin panel</a></p>`
    : '';

  return `
    <h2>New contact message</h2>
    <p><strong>From:</strong> ${escapeHtml(message.name)} &lt;${escapeHtml(message.email)}&gt;</p>
    ${message.subject ? `<p><strong>Subject:</strong> ${escapeHtml(message.subject)}</p>` : ''}
    <p><strong>Locale:</strong> ${escapeHtml(message.locale)}</p>
    <hr>
    <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(message.message)}</pre>
    ${adminLink}
  `;
}

export const mailer = {
  enabled,
  async notifyNewMessage(message) {
    if (!transporter) return;
    try {
      await transporter.sendMail({
        from: config.mailer.from || config.mailer.user || 'noreply@portfolio',
        to: config.mailer.to,
        subject: `[Portfolio] New message from ${message.name}`,
        replyTo: message.email,
        html: renderHtml(message),
      });
    } catch (err) {
      console.error('[mailer] Failed to send notification', err);
    }
  },
};
