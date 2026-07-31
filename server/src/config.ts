import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

function int(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: int(process.env.PORT, 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:5000/api',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    cookieName: process.env.JWT_COOKIE_NAME || 'hc_refresh',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: int(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'HireConnect <no-reply@hireconnect.com>',
    dev: process.env.SMTP_DEV === 'true' || true,
  },
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../uploads'),
  maxFileSizeMb: int(process.env.MAX_FILE_SIZE_MB, 5),
};

export const isProd = config.nodeEnv === 'production';
