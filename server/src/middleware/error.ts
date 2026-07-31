import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../lib/errors';
import { Prisma } from '@prisma/client';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, 'Route not found'));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ success: false, message: err.message, details: err.details });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || ['field'];
      res.status(409).json({ success: false, message: `Duplicate value for: ${target.join(', ')}` });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }
  }
  if (err instanceof SyntaxError) {
    res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    return;
  }
  console.error('[error]', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ success: false, message });
}
