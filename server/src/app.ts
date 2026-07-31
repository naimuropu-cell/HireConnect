import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';
import { config } from './config';
import { ensureUploadDir } from './lib/upload';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  ensureUploadDir();
  app.use('/api/uploads', express.static(path.resolve(config.uploadDir)));

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'HireConnect API is running', uptime: process.uptime() });
  });

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
