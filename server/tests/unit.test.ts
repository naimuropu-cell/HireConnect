import { describe, expect, it } from 'vitest';
import { generateOtp, hashPassword, verifyPassword, sha256 } from '../src/lib/crypto';
import { getPagination, paginated } from '../src/utils/pagination';

describe('crypto', () => {
  it('generates a 6-digit numeric OTP', () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('Password@123');
    expect(hash).not.toBe('Password@123');
    expect(await verifyPassword('Password@123', hash)).toBe(true);
    expect(await verifyPassword('WrongPass@123', hash)).toBe(false);
  });

  it('sha256 is deterministic', () => {
    expect(sha256('abc')).toBe(sha256('abc'));
    expect(sha256('abc')).not.toBe(sha256('abd'));
  });
});

describe('pagination', () => {
  it('parses pagination params with defaults', () => {
    expect(getPagination({})).toEqual({ page: 1, pageSize: 12 });
    expect(getPagination({ page: '3', pageSize: '25' })).toEqual({ page: 3, pageSize: 25 });
  });

  it('clamps invalid values', () => {
    expect(getPagination({ page: '-5', pageSize: '9999' })).toEqual({ page: 1, pageSize: 100 });
  });

  it('builds a paginated envelope', () => {
    const out = paginated([1, 2], 20, { page: 1, pageSize: 2 });
    expect(out.totalPages).toBe(10);
    expect(out.items).toEqual([1, 2]);
  });
});
