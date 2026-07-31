import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { validatedData } from '../middleware/validate';
import { NotFoundError } from '../lib/errors';
import { getPagination, paginated } from '../utils/pagination';
import { notify, approvedEmail } from '../lib/notifications';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ------------------------------ USERS ------------------------------------

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query;
  const { page, pageSize } = getPagination(q);
  const where: Prisma.UserWhereInput = {};
  if (q.q) {
    where.OR = [
      { email: { contains: String(q.q) } },
      { firstName: { contains: String(q.q) } },
      { lastName: { contains: String(q.q) } },
    ];
  }
  if (q.role) where.role = String(q.role).toUpperCase();
  if (q.active !== undefined) where.isActive = q.active === 'true';

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ success: true, ...paginated(items, total, { page, pageSize }) });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new NotFoundError('User not found');
  if (user.role === 'ADMIN') throw new NotFoundError('Cannot modify admin accounts');
  const { body } = validatedData<{ body: any }>(req);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { isActive: body.isActive, role: body.role ?? undefined },
  });
  res.json({
    success: true,
    user: { id: updated.id, isActive: updated.isActive, role: updated.role },
  });
});

// ---------------------------- COMPANIES ----------------------------------

export const listCompanies = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query;
  const { page, pageSize } = getPagination(q);
  const where: Prisma.CompanyWhereInput = {};
  if (q.approved !== undefined) where.approved = q.approved === 'true';
  if (q.q) where.name = { contains: String(q.q) };

  const [items, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } }, _count: { select: { jobs: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.company.count({ where }),
  ]);
  res.json({ success: true, ...paginated(items, total, { page, pageSize }) });
});

export const approveCompany = asyncHandler(async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({
    where: { id: req.params.id },
    include: { owner: true },
  });
  if (!company) throw new NotFoundError('Company not found');
  const updated = await prisma.company.update({
    where: { id: company.id },
    data: { approved: true, approvedAt: new Date() },
  });
  const email = approvedEmail(company.name);
  await notify({
    userId: company.userId,
    type: 'ADMIN',
    title: 'Company approved',
    message: `Congratulations! Your company "${company.name}" was approved. You can now post jobs.`,
    link: '/employer',
    email: { to: company.owner.email, name: company.owner.firstName, subject: email.subject, html: email.html },
  });
  res.json({ success: true, company: updated });
});

// ------------------------------ JOBS -------------------------------------

export const listAllJobs = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query;
  const { page, pageSize } = getPagination(q);
  const where: Prisma.JobWhereInput = {};
  if (q.status) where.status = String(q.status).toUpperCase();
  if (q.q) where.title = { contains: String(q.q) };

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: true, category: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where }),
  ]);
  res.json({ success: true, ...paginated(items, total, { page, pageSize }) });
});

export const moderateJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new NotFoundError('Job not found');
  const { body } = validatedData<{ body: any }>(req);
  const updated = await prisma.job.update({
    where: { id: job.id },
    data: { status: body.status, featured: body.featured ?? undefined },
  });
  res.json({ success: true, job: updated });
});

// ------------------------- CATEGORIES & SKILLS ---------------------------

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const category = await prisma.category.create({
    data: { name: body.name, slug: slugify(body.name), description: body.description },
  });
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { name: body.name ?? undefined, description: body.description ?? undefined },
  });
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Category deleted' });
});

export const createSkill = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const skill = await prisma.skill.create({
    data: { name: body.name, slug: slugify(body.name) },
  });
  res.status(201).json({ success: true, skill });
});

export const deleteSkill = asyncHandler(async (req: Request, res: Response) => {
  await prisma.skill.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Skill deleted' });
});

// ----------------------------- REPORTS -----------------------------------

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const report = await prisma.report.create({
    data: {
      reporterId: req.user!.id,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      details: body.details || null,
    },
  });
  res.status(201).json({ success: true, report });
});

export const listReports = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query;
  const { page, pageSize } = getPagination(q);
  const where: Prisma.ReportWhereInput = {};
  if (q.status) where.status = String(q.status).toUpperCase();

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: { reporter: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.report.count({ where }),
  ]);
  res.json({ success: true, ...paginated(items, total, { page, pageSize }) });
});

export const resolveReport = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) throw new NotFoundError('Report not found');
  const updated = await prisma.report.update({
    where: { id: report.id },
    data: { status: body.action, resolvedBy: req.user!.id, resolvedAt: new Date() },
  });
  res.json({ success: true, report: updated });
});

export const analytics = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [newUsersToday, newJobsToday, newApplicationsToday, weeklyUsers, weeklyApplications, hired, rejected, pending] =
    await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.job.count({ where: { createdAt: { gte: today } } }),
      prisma.application.count({ where: { appliedAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.application.count({ where: { appliedAt: { gte: weekAgo } } }),
      prisma.application.count({ where: { status: 'HIRED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.application.count({ where: { status: 'PENDING' } }),
    ]);
  const totalDecided = hired + rejected + pending;
  const hiringRate = totalDecided > 0 ? Math.round((hired / totalDecided) * 100) : 0;

  res.json({
    success: true,
    analytics: {
      newUsersToday,
      newJobsToday,
      newApplicationsToday,
      weeklyUsers,
      weeklyApplications,
      hired,
      rejected,
      hiringRate,
    },
  });
});
