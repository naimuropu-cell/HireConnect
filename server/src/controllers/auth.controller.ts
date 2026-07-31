import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, generateOtp, sha256 } from '../lib/crypto';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { asyncHandler } from '../lib/asyncHandler';
import { validatedData } from '../middleware/validate';
import { ConflictError, UnauthorizedError } from '../lib/errors';
import { config } from '../config';
import { sendMail } from '../lib/mailer';
import { emailVerifyTemplate, passwordResetTemplate } from '../utils/emailTemplates';

const OTP_TTL_MS = 10 * 60 * 1000;

function serializeUser(user: any) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

async function sendOtp(user: { id: string; email: string; firstName: string }, purpose: 'EMAIL_VERIFY' | 'PASSWORD_RESET') {
  await prisma.otpCode.updateMany({ where: { userId: user.id, purpose }, data: { used: true } });
  const code = generateOtp();
  await prisma.otpCode.create({
    data: { userId: user.id, code, purpose, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });
  const template = purpose === 'EMAIL_VERIFY' ? emailVerifyTemplate(code, user.firstName) : passwordResetTemplate(code, user.firstName);
  await sendMail({ to: user.email, subject: template.subject, html: template.html });
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie(config.jwt.cookieName, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      password: await hashPassword(body.password),
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      role: body.role,
    },
  });

  if (body.role === 'SEEKER') {
    await prisma.profile.create({ data: { userId: user.id } });
  } else {
    await prisma.company.create({
      data: { userId: user.id, name: `${body.firstName} ${body.lastName}'s Company`, slug: `company-${user.id.slice(0, 8)}` },
    });
  }

  await sendOtp(user, 'EMAIL_VERIFY');

  res.status(201).json({
    success: true,
    message: 'Account created. Please verify your email using the code we sent.',
  });
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user) throw new UnauthorizedError('No account found for this email');
  await sendOtp(user, body.purpose || 'EMAIL_VERIFY');
  res.json({ success: true, message: 'A new code has been sent.' });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user) throw new UnauthorizedError('No account found for this email');

  const otp = await prisma.otpCode.findFirst({
    where: { userId: user.id, purpose: 'EMAIL_VERIFY', used: false },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp || otp.code !== body.code || otp.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired code');
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });

  res.json({ success: true, message: 'Email verified successfully.' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user || !(await verifyPassword(body.password, user.password))) {
    throw new UnauthorizedError('Invalid email or password');
  }
  if (!user.isActive) throw new UnauthorizedError('This account has been disabled');

  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: sha256(refreshToken), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
  if (body.rememberMe) setRefreshCookie(res, refreshToken);

  res.json({ success: true, accessToken, refreshToken, user: serializeUser(user) });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const token = body.refreshToken || (req.cookies?.[config.jwt.cookieName] as string) || '';
  if (!token) throw new UnauthorizedError('Refresh token required');

  let payload: any;
  try {
    const { verifyRefreshToken } = await import('../lib/jwt');
    payload = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw new UnauthorizedError('Account unavailable');

  const newAccess = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  res.json({ success: true, accessToken: newAccess, user: serializeUser(user) });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const token = body.refreshToken || (req.cookies?.[config.jwt.cookieName] as string) || '';
  if (token) {
    await prisma.refreshToken.updateMany({ where: { tokenHash: sha256(token) }, data: { revoked: true } });
  }
  res.clearCookie(config.jwt.cookieName);
  res.json({ success: true, message: 'Logged out' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (user) await sendOtp(user, 'PASSWORD_RESET');
  res.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user) throw new UnauthorizedError('No account found for this email');

  const otp = await prisma.otpCode.findFirst({
    where: { userId: user.id, purpose: 'PASSWORD_RESET', used: false },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp || otp.code !== body.code || otp.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired code');
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
  await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(body.newPassword) } });
  await prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revoked: true } });

  res.json({ success: true, message: 'Password has been reset. You can now log in.' });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validatedData<{ body: any }>(req);
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new UnauthorizedError('Account not found');
  if (!(await verifyPassword(body.currentPassword, user.password))) {
    throw new UnauthorizedError('Current password is incorrect');
  }
  await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(body.newPassword) } });
  await prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revoked: true } });
  res.json({ success: true, message: 'Password changed. Please log in again.' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { profile: true, company: true },
  });
  if (!user) throw new UnauthorizedError('Account not found');
  res.json({ success: true, user: serializeUser(user) });
});
