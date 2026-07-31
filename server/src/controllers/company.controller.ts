import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { validatedData } from '../middleware/validate';
import { ConflictError, NotFoundError } from '../lib/errors';
import { publicFileUrl } from '../lib/upload';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const createCompany = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const existing = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (existing) throw new ConflictError('You already have a company profile');

  let slug = slugify(body.name);
  let n = 1;
  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${slugify(body.name)}-${n++}`;
  }

  const company = await prisma.company.create({
    data: {
      userId: req.user!.id,
      name: body.name,
      slug,
      description: body.description,
      website: body.website || null,
      industry: body.industry || null,
      size: body.size || null,
      location: body.location || null,
      foundedYear: body.foundedYear || null,
    },
  });
  await prisma.notification.create({
    data: {
      userId: req.user!.id,
      type: 'SYSTEM',
      title: 'Company submitted',
      message: 'Your company is awaiting approval by an admin. You will be notified once approved.',
    },
  });
  res.status(201).json({ success: true, company });
});

export const getMyCompany = asyncHandler(async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({
    where: { userId: req.user!.id },
    include: { _count: { select: { jobs: true } } },
  });
  if (!company) throw new NotFoundError('Company profile not found');
  res.json({ success: true, company });
});

export const updateCompany = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company) throw new NotFoundError('Company profile not found');
  const updated = await prisma.company.update({
    where: { id: company.id },
    data: {
      name: body.name ?? undefined,
      description: body.description ?? undefined,
      website: body.website ?? undefined,
      industry: body.industry ?? undefined,
      size: body.size ?? undefined,
      location: body.location ?? undefined,
      foundedYear: body.foundedYear ?? undefined,
    },
  });
  res.json({ success: true, company: updated });
});

export const uploadLogo = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new NotFoundError('No file uploaded');
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company) throw new NotFoundError('Company profile not found');
  const updated = await prisma.company.update({
    where: { id: company.id },
    data: { logo: publicFileUrl((req.file as Express.Multer.File).filename) },
  });
  res.json({ success: true, company: updated });
});

export const getPublicCompany = asyncHandler(async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({
    where: { slug: req.params.slug },
    include: { jobs: { where: { status: 'OPEN' }, orderBy: { createdAt: 'desc' } } },
  });
  if (!company) throw new NotFoundError('Company not found');
  res.json({ success: true, company });
});

export const listCompanies = asyncHandler(async (req: Request, res: Response) => {
  const companies = await prisma.company.findMany({
    where: { approved: true },
    include: { _count: { select: { jobs: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, companies });
});
