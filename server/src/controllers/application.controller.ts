import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { validatedData } from '../middleware/validate';
import { ConflictError, ForbiddenError, NotFoundError } from '../lib/errors';
import { notify, applicationStatusEmail, interviewEmail } from '../lib/notifications';

const applicationInclude = {
  job: { include: { company: true, category: true } },
  user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
  interviews: { orderBy: { scheduledAt: 'desc' } },
} as const;

export const applyToJob = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new NotFoundError('Job not found');
  if (job.status !== 'OPEN') throw new ConflictError('This job is no longer accepting applications');
  if (job.deadline && job.deadline < new Date()) throw new ConflictError('This job has passed its deadline');

  const existing = await prisma.application.findUnique({
    where: { jobId_userId: { jobId: job.id, userId: req.user!.id } },
  });
  if (existing) throw new ConflictError('You have already applied to this job');

  const profile = await prisma.profile.findUnique({ where: { userId: req.user!.id } });
  if (profile && profile.resumeUrl && !body.resumeUrl) {
    body.resumeUrl = profile.resumeUrl;
    body.resumeName = profile.resumeName;
  }

  const application = await prisma.application.create({
    data: {
      jobId: job.id,
      userId: req.user!.id,
      coverLetter: body.coverLetter || null,
      resumeUrl: body.resumeUrl || null,
      resumeName: body.resumeName || null,
    },
    include: applicationInclude,
  });

  const company = await prisma.company.findUnique({ where: { id: job.companyId } });
  if (company) {
    await notify({
      userId: company.userId,
      type: 'APPLICATION_UPDATE',
      title: 'New application',
      message: `Someone applied to "${job.title}"`,
      link: '/employer/applications',
    });
  }

  res.status(201).json({ success: true, application });
});

export const withdrawApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await prisma.application.findUnique({ where: { id: req.params.id } });
  if (!application) throw new NotFoundError('Application not found');
  if (application.userId !== req.user!.id) throw new ForbiddenError('Forbidden');
  const updated = await prisma.application.update({
    where: { id: application.id },
    data: { status: 'WITHDRAWN' },
    include: applicationInclude,
  });
  res.json({ success: true, application: updated });
});

export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const applications = await prisma.application.findMany({
    where: { userId: req.user!.id },
    include: { job: { include: { company: true } }, interviews: true },
    orderBy: { appliedAt: 'desc' },
  });
  res.json({ success: true, applications });
});

export const listApplicants = asyncHandler(async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company) throw new ForbiddenError('Company profile required');
  const job = await prisma.job.findFirst({ where: { id: req.params.jobId, companyId: company.id } });
  if (!job) throw new NotFoundError('Job not found');

  const where: any = { jobId: job.id };
  if (req.query.status) where.status = String(req.query.status).toUpperCase();

  const applications = await prisma.application.findMany({
    where,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      interviews: true,
    },
    orderBy: { appliedAt: 'desc' },
  });

  const withProfiles = await Promise.all(
    applications.map(async (app) => {
      const profile = await prisma.profile.findUnique({
        where: { userId: app.userId },
        include: { skills: { include: { skill: true } }, experience: { orderBy: { startDate: 'desc' } } },
      });
      return { ...app, profile: profile || null };
    })
  );

  res.json({ success: true, applications: withProfiles });
});

export const getApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await prisma.application.findUnique({ where: { id: req.params.id }, include: applicationInclude });
  if (!application) throw new NotFoundError('Application not found');
  res.json({ success: true, application });
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: { job: { include: { company: true } }, user: true },
  });
  if (!application) throw new NotFoundError('Application not found');
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company || company.id !== application.job.companyId) throw new ForbiddenError('Forbidden');

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: {
      status: body.status,
      decidedAt: ['REJECTED', 'HIRED'].includes(body.status) ? new Date() : application.decidedAt,
      notes: body.notes ?? undefined,
    },
  });

  const email = applicationStatusEmail(
    `${application.user.firstName} ${application.user.lastName}`,
    application.job.title,
    application.job.company.name,
    body.status
  );
  await notify({
    userId: application.userId,
    type: 'APPLICATION_UPDATE',
    title: 'Application update',
    message: `Your application for "${application.job.title}" at ${application.job.company.name} was ${body.status.toLowerCase()}`,
    link: '/applications',
    email: { to: application.user.email, name: application.user.firstName, subject: email.subject, html: email.html },
  });

  res.json({ success: true, application: updated });
});

export const scheduleInterview = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: { job: { include: { company: true } }, user: true },
  });
  if (!application) throw new NotFoundError('Application not found');
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company || company.id !== application.job.companyId) throw new ForbiddenError('Forbidden');

  const interview = await prisma.interview.create({
    data: {
      applicationId: application.id,
      scheduledAt: new Date(body.scheduledAt),
      durationMin: body.durationMin,
      mode: body.mode,
      link: body.link || null,
      location: body.location || null,
      notes: body.notes || null,
      createdBy: req.user!.id,
    },
  });

  await prisma.application.update({ where: { id: application.id }, data: { status: 'INTERVIEW' } });

  const formatted = new Date(body.scheduledAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const email = interviewEmail(
    `${application.user.firstName} ${application.user.lastName}`,
    application.job.title,
    application.job.company.name,
    formatted,
    body.link
  );
  await notify({
    userId: application.userId,
    type: 'INTERVIEW',
    title: 'Interview scheduled',
    message: `You have an interview for "${application.job.title}" at ${application.job.company.name} on ${formatted}`,
    link: '/applications',
    email: { to: application.user.email, name: application.user.firstName, subject: email.subject, html: email.html },
  });

  res.status(201).json({ success: true, interview });
});

export const listInterviews = asyncHandler(async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company) throw new ForbiddenError('Company profile required');
  const interviews = await prisma.interview.findMany({
    where: { application: { job: { companyId: company.id } } },
    include: {
      application: { include: { job: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
    },
    orderBy: { scheduledAt: 'desc' },
  });
  res.json({ success: true, interviews });
});
