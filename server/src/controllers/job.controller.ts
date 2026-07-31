import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { validatedData } from '../middleware/validate';
import { ForbiddenError, NotFoundError } from '../lib/errors';
import { getPagination, paginated } from '../utils/pagination';

const listInclude = {
  company: true,
  category: true,
  requiredSkills: { include: { skill: true } },
  _count: { select: { applications: true } },
} as const;

const detailInclude = {
  company: true,
  category: true,
  requiredSkills: { include: { skill: true } },
  applications: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } } },
} as const;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company) throw new ForbiddenError('You need a company profile to post jobs');
  if (!company.approved) throw new ForbiddenError('Your company is pending approval by an admin');

  const baseSlug = slugify(body.title);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.job.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      categoryId: body.categoryId || null,
      title: body.title,
      slug,
      description: body.description,
      type: body.type,
      workMode: body.workMode,
      location: body.location || company.location,
      salaryMin: body.salaryMin ?? null,
      salaryMax: body.salaryMax ?? null,
      currency: body.currency,
      experienceLevel: body.experienceLevel,
      vacancies: body.vacancies,
      deadline: body.deadline ? new Date(body.deadline) : null,
      status: body.status,
      featured: body.featured || false,
      publishedAt: body.status === 'OPEN' ? new Date() : null,
      requiredSkills: {
        create: await Promise.all(
          (body.requiredSkills || []).map(async (name: string) => {
            const skill = await prisma.skill.upsert({
              where: { name },
              update: {},
              create: { name, slug: slugify(name) },
            });
            return { skillId: skill.id };
          })
        ),
      },
    },
    include: { company: true, category: true, requiredSkills: { include: { skill: true } } },
  });

  res.status(201).json({ success: true, job });
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new NotFoundError('Job not found');
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company || company.id !== job.companyId) throw new ForbiddenError('You can only edit your own jobs');

  const data: any = {
    title: body.title,
    categoryId: body.categoryId ?? undefined,
    description: body.description,
    type: body.type,
    workMode: body.workMode,
    location: body.location ?? undefined,
    salaryMin: body.salaryMin ?? undefined,
    salaryMax: body.salaryMax ?? undefined,
    currency: body.currency,
    experienceLevel: body.experienceLevel,
    vacancies: body.vacancies,
    deadline: body.deadline !== undefined ? (body.deadline ? new Date(body.deadline) : null) : undefined,
    featured: body.featured,
    status: body.status,
  };
  if (body.status === 'OPEN' && !job.publishedAt) data.publishedAt = new Date();
  if (body.status === 'CLOSED') data.status = 'CLOSED';

  if (Array.isArray(body.requiredSkills)) {
    data.requiredSkills = {
      deleteMany: {},
      create: await Promise.all(
        body.requiredSkills.map(async (name: string) => {
          const skill = await prisma.skill.upsert({
            where: { name },
            update: {},
            create: { name, slug: slugify(name) },
          });
          return { skillId: skill.id };
        })
      ),
    };
  }

  const updated = await prisma.job.update({
    where: { id: job.id },
    data,
    include: { company: true, category: true, requiredSkills: { include: { skill: true } } },
  });
  res.json({ success: true, job: updated });
});

export const closeJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new NotFoundError('Job not found');
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company || company.id !== job.companyId) throw new ForbiddenError('You can only close your own jobs');
  const updated = await prisma.job.update({ where: { id: job.id }, data: { status: 'CLOSED' } });
  res.json({ success: true, job: updated });
});

export const reopenJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new NotFoundError('Job not found');
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company || company.id !== job.companyId) throw new ForbiddenError('Forbidden');
  const updated = await prisma.job.update({
    where: { id: job.id },
    data: { status: 'OPEN', publishedAt: job.publishedAt || new Date() },
  });
  res.json({ success: true, job: updated });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new NotFoundError('Job not found');
  const isAdmin = req.user!.role === 'ADMIN';
  const company = isAdmin ? null : await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!isAdmin && (!company || company.id !== job.companyId)) throw new ForbiddenError('Forbidden');
  await prisma.job.delete({ where: { id: job.id } });
  res.json({ success: true, message: 'Job deleted' });
});

export const getJob = asyncHandler(async (req: Request, res: Response) => {
  await prisma.job.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } });
  const job = await prisma.job.findUnique({ where: { id: req.params.id }, include: detailInclude });
  if (!job) throw new NotFoundError('Job not found');
  res.json({ success: true, job });
});

export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const q = validatedData<{ query: any }>(req).query;
  const { page, pageSize } = getPagination(q);

  const where: Prisma.JobWhereInput = { status: 'OPEN' };
  if (q.q) {
    where.OR = [
      { title: { contains: q.q } },
      { description: { contains: q.q } },
      { location: { contains: q.q } },
      { company: { is: { name: { contains: q.q } } } },
      { requiredSkills: { some: { skill: { name: { contains: q.q } } } } },
    ];
  }
  if (q.category) {
    where.category = {
      OR: [{ id: q.category }, { slug: q.category }],
    };
  }
  if (q.location) where.location = { contains: q.location };
  if (q.company) where.company = { is: { name: { contains: q.company } } };
  if (q.type) where.type = { in: String(q.type).split(',') };
  if (q.workMode) where.workMode = { in: String(q.workMode).split(',') };
  if (q.experience) where.experienceLevel = { in: String(q.experience).split(',') };
  if (q.salaryMin) where.salaryMax = { gte: Number(q.salaryMin) };
  if (q.salaryMax) where.salaryMin = { lte: Number(q.salaryMax) };

  const orderBy: Prisma.JobOrderByWithRelationInput[] =
    q.sort === 'oldest'
      ? [{ createdAt: 'asc' }]
      : q.sort === 'salary_high'
      ? [{ salaryMax: 'desc' }, { createdAt: 'desc' }]
      : q.sort === 'salary_low'
      ? [{ salaryMin: 'asc' }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }];

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: listInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  res.json({ success: true, ...paginated(items, total, { page, pageSize }) });
});

export const listMyJobs = asyncHandler(async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company) throw new NotFoundError('Company profile not found');
  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: { category: true, _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, jobs });
});

export const incrementViews = asyncHandler(async (req: Request, res: Response) => {
  await prisma.job.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } });
  res.json({ success: true });
});

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({ include: { _count: { select: { jobs: true } } }, orderBy: { name: 'asc' } });
  res.json({ success: true, categories });
});

export const getSkills = asyncHandler(async (_req: Request, res: Response) => {
  const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, skills });
});

export const saveJob = asyncHandler(async (req: Request, res: Response) => {
  await prisma.savedJob.upsert({
    where: { userId_jobId: { userId: req.user!.id, jobId: req.params.id } },
    update: {},
    create: { userId: req.user!.id, jobId: req.params.id },
  });
  res.status(201).json({ success: true, message: 'Job saved' });
});

export const unsaveJob = asyncHandler(async (req: Request, res: Response) => {
  await prisma.savedJob.deleteMany({ where: { userId: req.user!.id, jobId: req.params.id } });
  res.json({ success: true, message: 'Job removed from saved' });
});

export const getSavedJobs = asyncHandler(async (req: Request, res: Response) => {
  const saved = await prisma.savedJob.findMany({
    where: { userId: req.user!.id },
    include: { job: { include: { company: true, category: true, requiredSkills: { include: { skill: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, saved });
});
