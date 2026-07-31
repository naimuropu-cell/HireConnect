import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { validatedData } from '../middleware/validate';
import { NotFoundError } from '../lib/errors';
import { publicFileUrl } from '../lib/upload';

const profileInclude = {
  skills: { include: { skill: true } },
  education: true,
  experience: true,
  certifications: true,
} as const;

function computeCompletion(profile: any): number {
  const fields = [
    profile.headline,
    profile.about,
    profile.location,
    profile.phone,
    profile.resumeUrl,
    profile.portfolio,
    profile.github,
    profile.linkedin,
    profile.languages && profile.languages.length > 0,
  ];
  let filled = fields.filter(Boolean).length;
  if (profile.skills.length > 0) filled++;
  if (profile.education.length > 0) filled++;
  if (profile.experience.length > 0) filled++;
  if (profile.certifications.length > 0) filled++;
  return Math.min(100, Math.round((filled / 13) * 100));
}

function serialize(profile: any) {
  return {
    ...profile,
    languages: profile.languages ? profile.languages.split(',') : [],
    completion: computeCompletion(profile),
  };
}

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.user!.id },
    include: profileInclude,
  });
  if (!profile) {
    const created = await prisma.profile.create({ data: { userId: req.user!.id }, include: profileInclude });
    return res.json({ success: true, profile: serialize(created) });
  }
  res.json({ success: true, profile: serialize(profile) });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);

  let profile = await prisma.profile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) {
    profile = await prisma.profile.create({ data: { userId: req.user!.id } });
  }

  const baseData: any = {
    headline: body.headline,
    about: body.about,
    location: body.location,
    phone: body.phone,
    dateOfBirth: body.dateOfBirth,
    portfolio: body.portfolio,
    github: body.github,
    linkedin: body.linkedin,
  };

  if (Array.isArray(body.languages)) baseData.languages = body.languages.join(',');
  if (body.skills !== undefined) baseData.skills = { deleteMany: {} };
  if (body.education !== undefined) baseData.education = { deleteMany: {} };
  if (body.experience !== undefined) baseData.experience = { deleteMany: {} };
  if (body.certifications !== undefined) baseData.certifications = { deleteMany: {} };

  const tx: any[] = [];
  if (Array.isArray(body.skills)) {
    for (const s of body.skills) {
      const skill = await prisma.skill.upsert({
        where: { name: s.name },
        update: {},
        create: { name: s.name, slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      });
      tx.push({ skillId: skill.id, level: s.level || 'INTERMEDIATE' });
    }
  }
  if (Array.isArray(body.education)) {
    tx.push(
      ...body.education.map((e: any) => ({
        institution: e.institution,
        degree: e.degree,
        field: e.field,
        startDate: e.startDate,
        endDate: e.endDate,
        description: e.description,
      }))
    );
  }
  if (Array.isArray(body.experience)) {
    tx.push(
      ...body.experience.map((e: any) => ({
        company: e.company,
        title: e.title,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        current: e.current || false,
        description: e.description,
      }))
    );
  }
  if (Array.isArray(body.certifications)) {
    tx.push(
      ...body.certifications.map((c: any) => ({
        name: c.name,
        issuer: c.issuer,
        url: c.url,
        issuedDate: c.issuedDate,
      }))
    );
  }

  await prisma.$transaction(async (client) => {
    await client.profile.update({ where: { id: profile.id }, data: baseData });
    if (Array.isArray(body.skills)) {
      await client.profileSkill.createMany({
        data: tx.filter((t) => 'skillId' in t).map((t) => ({ profileId: profile.id, skillId: t.skillId, level: t.level })),
      });
    }
    if (Array.isArray(body.education)) {
      await client.education.createMany({
        data: tx.filter((t) => 'institution' in t).map((t) => ({ ...t, profileId: profile.id })),
      });
    }
    if (Array.isArray(body.experience)) {
      await client.experience.createMany({
        data: tx.filter((t) => 'company' in t).map((t) => ({ ...t, profileId: profile.id })),
      });
    }
    if (Array.isArray(body.certifications)) {
      await client.certification.createMany({
        data: tx.filter((t) => 'name' in t).map((t) => ({ ...t, profileId: profile.id })),
      });
    }
  });

  const updated = await prisma.profile.findUnique({ where: { userId: req.user!.id }, include: profileInclude });
  res.json({ success: true, profile: serialize(updated) });
});

export const uploadResume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new NotFoundError('No file uploaded');
  const filename = (req.file as Express.Multer.File).filename;
  const profile = await prisma.profile.upsert({
    where: { userId: req.user!.id },
    update: { resumeUrl: publicFileUrl(filename), resumeName: req.file.originalname },
    create: { userId: req.user!.id, resumeUrl: publicFileUrl(filename), resumeName: req.file.originalname },
  });
  res.json({ success: true, resumeUrl: profile.resumeUrl, resumeName: profile.resumeName });
});

export const removeResume = asyncHandler(async (req: Request, res: Response) => {
  await prisma.profile.updateMany({
    where: { userId: req.user!.id },
    data: { resumeUrl: null, resumeName: null },
  });
  res.json({ success: true, message: 'Resume removed' });
});

export const getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.params.userId },
    include: profileInclude,
  });
  if (!profile) throw new NotFoundError('Profile not found');
  const { userId: _u, resumeUrl: _r, resumeName: _n, ...safe } = profile;
  res.json({ success: true, profile: serialize(safe) });
});
