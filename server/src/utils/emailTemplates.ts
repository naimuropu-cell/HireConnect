import { config } from '../config';

function layout(title: string, body: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;color:#0f172a">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#4f46e5;color:#fff;padding:20px 28px;font-size:18px;font-weight:700">${config.smtp.from.replace(/.*<|>.*/g, '') || 'HireConnect'}</div>
    <div style="padding:28px">
      <h2 style="margin:0 0 12px;font-size:18px">${title}</h2>
      ${body}
    </div>
    <div style="padding:16px 28px;background:#f8fafc;color:#64748b;font-size:12px">
      <a href="${config.clientUrl}" style="color:#4f46e5">HireConnect</a> — Intelligent hiring platform
    </div>
  </div></body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">${label}</a>`;
}

export function emailVerifyTemplate(code: string, name: string): { subject: string; html: string } {
  return {
    subject: 'Verify your email',
    html: layout(
      'Verify your email',
      `<p>Hi ${name},</p><p>Your verification code is:</p>
       <div style="font-size:32px;letter-spacing:8px;font-weight:800;color:#4f46e5;margin:12px 0">${code}</div>
       <p>This code expires in 10 minutes.</p>`
    ),
  };
}

export function passwordResetTemplate(code: string, name: string): { subject: string; html: string } {
  return {
    subject: 'Reset your password',
    html: layout(
      'Reset your password',
      `<p>Hi ${name},</p><p>Use the code below to reset your password:</p>
       <div style="font-size:32px;letter-spacing:8px;font-weight:800;color:#4f46e5;margin:12px 0">${code}</div>
       <p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>`
    ),
  };
}

export function applicationStatusTemplate(
  name: string,
  jobTitle: string,
  companyName: string,
  status: string
): { subject: string; html: string } {
  const statusLabels: Record<string, string> = {
    VIEWED: 'viewed',
    SHORTLISTED: 'shortlisted',
    INTERVIEW: 'invited to an interview',
    REJECTED: 'not selected',
    HIRED: 'hired',
  };
  const label = statusLabels[status] || status.toLowerCase();
  return {
    subject: `Application update for ${jobTitle}`,
    html: layout(
      'Application update',
      `<p>Hi ${name},</p><p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been <strong>${label}</strong>.</p>
       <p>Log in to track the latest status.</p>${button(config.clientUrl + '/applications', 'View applications')}`
    ),
  };
}

export function interviewScheduledTemplate(
  name: string,
  jobTitle: string,
  companyName: string,
  scheduledAt: string,
  link?: string
): { subject: string; html: string } {
  return {
    subject: `Interview scheduled: ${jobTitle}`,
    html: layout(
      'Interview scheduled',
      `<p>Hi ${name},</p><p>Congratulations! You have an interview scheduled for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> on <strong>${scheduledAt}</strong>.</p>
       ${link ? `<p>Join link: <a href="${link}">${link}</a></p>` : ''}
       <p>Prepare well and good luck!</p>`
    ),
  };
}

export function employerApprovedTemplate(companyName: string): { subject: string; html: string } {
  return {
    subject: 'Your company has been approved',
    html: layout(
      'Company approved',
      `<p>Great news!</p><p>Your company <strong>${companyName}</strong> has been approved. You can now post jobs and manage applicants.</p>
       ${button(config.clientUrl + '/employer', 'Go to dashboard')}`
    ),
  };
}
