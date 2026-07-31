import { prisma } from './prisma';
import { emitToUser } from './socket';
import { sendMail } from './mailer';
import {
  applicationStatusTemplate,
  interviewScheduledTemplate,
  employerApprovedTemplate,
} from '../utils/emailTemplates';

export interface NotifyInput {
  userId: string;
  type: 'APPLICATION_UPDATE' | 'INTERVIEW' | 'JOB' | 'SYSTEM' | 'ADMIN';
  title: string;
  message: string;
  link?: string;
  email?: { to: string; name: string; subject: string; html: string };
}

export async function notify(input: NotifyInput): Promise<void> {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
    },
  });
  emitToUser(input.userId, 'notification', notification);
  if (input.email) {
    await sendMail({ to: input.email.to, subject: input.email.subject, html: input.email.html });
  }
}

export function applicationStatusEmail(seekerName: string, jobTitle: string, companyName: string, status: string) {
  return applicationStatusTemplate(seekerName, jobTitle, companyName, status);
}

export function interviewEmail(
  seekerName: string,
  jobTitle: string,
  companyName: string,
  scheduledAt: string,
  link?: string
) {
  return interviewScheduledTemplate(seekerName, jobTitle, companyName, scheduledAt, link);
}

export function approvedEmail(companyName: string) {
  return employerApprovedTemplate(companyName);
}
