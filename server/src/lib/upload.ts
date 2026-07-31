import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { config } from '../config';

export const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const uploadDir = config.uploadDir;

export function ensureUploadDir(): void {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${Date.now()}-${nanoid(8)}${ext}`);
  },
});

export const uploadResume = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) return cb(null, true);
    const err: any = new Error('Only PDF or DOC/DOCX files are allowed');
    err.status = 400;
    cb(err);
  },
});

export const uploadLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    const err: any = new Error('Only image files are allowed');
    err.status = 400;
    cb(err);
  },
});

export function publicFileUrl(filename: string): string {
  return `${config.apiUrl}/uploads/${filename}`;
}
