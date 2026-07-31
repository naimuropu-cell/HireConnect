import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { NotFoundError } from '../lib/errors';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthlyBuckets(from: Date, to: Date) {
  const buckets: { key: string; label: string; start: Date; end: Date }[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  while (cur <= end) {
    const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    buckets.push({
      key: `${cur.getFullYear()}-${cur.getMonth()}`,
      label: `${months[cur.getMonth()]} ${cur.getFullYear()}`,
      start: cur,
      end: next,
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return buckets;
}

function fillMonthly<T>(buckets: { key: string; label: string }[], rows: { key: string; count: number }[]) {
  const map = new Map(rows.map((r) => [r.key, r.count]));
  return buckets.map((b) => ({ label: b.label, count: map.get(b.key) || 0 }));
}

export const employerDashboard = asyncHandler(async (req: Request, res: Response) => {
  const company = await prisma.company.findUnique({ where: { userId: req.user!.id } });
  if (!company) throw new NotFoundError('Company profile not found');

  const [activeJobs, totalApplications, shortlisted, interviews, hired, recentJobs] = await Promise.all([
    prisma.job.count({ where: { companyId: company.id, status: 'OPEN' } }),
    prisma.application.count({ where: { job: { companyId: company.id } } }),
    prisma.application.count({ where: { job: { companyId: company.id }, status: { in: ['SHORTLISTED', 'INTERVIEW', 'HIRED'] } } }),
    prisma.application.count({ where: { job: { companyId: company.id }, status: 'INTERVIEW' } }),
    prisma.application.count({ where: { job: { companyId: company.id }, status: 'HIRED' } }),
    prisma.job.findMany({
      where: { companyId: company.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // Monthly applications (last 6 months)
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const buckets = monthlyBuckets(from, now);
  const appRows = await prisma.application.groupBy({
    by: ['appliedAt'],
    where: { job: { companyId: company.id }, appliedAt: { gte: from } },
    _count: { _all: true },
  });
  const byKey = appRows.reduce((acc: Record<string, number>, r) => {
    const key = `${r.appliedAt.getFullYear()}-${r.appliedAt.getMonth()}`;
    acc[key] = (acc[key] || 0) + r._count._all;
    return acc;
  }, {});
  const monthlyApplications = fillMonthly(buckets, Object.entries(byKey).map(([key, count]) => ({ key, count: count as number })));

  // Job performance
  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const jobPerformance = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    status: j.status,
    views: j.views,
    applications: j._count.applications,
  }));

  const hiringRate = totalApplications > 0 ? Math.round((hired / totalApplications) * 100) : 0;

  res.json({
    success: true,
    stats: { activeJobs, totalApplications, shortlisted, interviews, hired, hiringRate },
    monthlyApplications,
    jobPerformance,
    recentJobs,
  });
});

export const adminDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [users, employers, companies, jobs, applications, pendingCompanies, pendingJobs, openJobs, reports] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.company.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.company.count({ where: { approved: false } }),
      prisma.job.count({ where: { status: 'DRAFT' } }),
      prisma.job.count({ where: { status: 'OPEN' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const buckets = monthlyBuckets(from, now);
  const [userRows, jobRows, appRows] = await Promise.all([
    prisma.user.groupBy({ by: ['createdAt'], where: { createdAt: { gte: from } }, _count: { _all: true } }),
    prisma.job.groupBy({ by: ['createdAt'], where: { createdAt: { gte: from } }, _count: { _all: true } }),
    prisma.application.groupBy({ by: ['appliedAt'], where: { appliedAt: { gte: from } }, _count: { _all: true } }),
  ]);
  const rowsToMap = (rows: any[]) =>
    rows.reduce((acc: Record<string, number>, r) => {
      const date = r.createdAt || r.appliedAt;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      acc[key] = (acc[key] || 0) + r._count._all;
      return acc;
    }, {});

  res.json({
    success: true,
    stats: { users, employers, companies, jobs, applications, openJobs, pendingCompanies, pendingJobs, reports },
    monthly: {
      users: fillMonthly(buckets, Object.entries(rowsToMap(userRows)).map(([key, count]) => ({ key, count: count as number }))),
      jobs: fillMonthly(buckets, Object.entries(rowsToMap(jobRows)).map(([key, count]) => ({ key, count: count as number }))),
      applications: fillMonthly(buckets, Object.entries(rowsToMap(appRows)).map(([key, count]) => ({ key, count: count as number }))),
    },
  });
});

export const candidateRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.jobId },
    include: { requiredSkills: { include: { skill: true } } },
  });
  if (!job) throw new NotFoundError('Job not found');

  const skillNames = job.requiredSkills.map((rs) => rs.skill.name.toLowerCase());
  const candidates = await prisma.profile.findMany({
    where: { skills: { some: {} }, resumeUrl: { not: null } },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      skills: { include: { skill: true } },
      experience: { orderBy: { startDate: 'desc' }, take: 3 },
    },
  });

  const scored = candidates
    .map((p) => {
      const profileSkills = p.skills.map((s) => s.skill.name.toLowerCase());
      const matches = profileSkills.filter((s) => skillNames.includes(s));
      const score = skillNames.length > 0 ? Math.round((matches.length / skillNames.length) * 100) : 0;
      return { ...p, matchScore: score, matchingSkills: matches.length };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);

  res.json({ success: true, candidates: scored });
});
