import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const where: any = { userId: req.user!.id };
  if (req.query.unread === 'true') where.read = false;

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));

  const [notifications, total, unread] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.notification.count({ where: { userId: req.user!.id } }),
    prisma.notification.count({ where: { userId: req.user!.id, read: false } }),
  ]);

  res.json({ success: true, notifications, total, unread, page, pageSize });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({ where: { userId: req.user!.id, read: false }, data: { read: true } });
  res.json({ success: true });
});

export const markOneRead = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user!.id }, data: { read: true } });
  res.json({ success: true });
});
