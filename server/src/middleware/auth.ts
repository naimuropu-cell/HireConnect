import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { UnauthorizedError } from '../lib/errors';
import { prisma } from '../lib/prisma';

export interface AuthUser {
  id: string;
  role: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication required'));
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError('Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }
    next();
  };
}

export async function requireActiveUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.user) return next(new UnauthorizedError('Authentication required'));
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || !user.isActive) return next(new UnauthorizedError('Account is disabled'));
  next();
}
