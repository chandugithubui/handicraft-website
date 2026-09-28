/**
 * server/src/routes/upload.routes.ts
 *
 * File upload route with Multer in TypeScript.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { adminAuth } from '../middleware/auth.middleware';

const router = Router();

const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post('/', adminAuth, (req: Request, res: Response) => {
  upload.single('image')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File too large. Maximum allowed size is 5 MB.',
        });
      }
      return res.status(400).json({
        message: `Upload error: ${err.message}`,
      });
    }

    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    const uploadedFile = (req as any).file;
    if (!uploadedFile) {
      return res.status(400).json({
        message: 'No image file provided. Use field name "image".',
      });
    }

    return res.status(201).json({
      imageUrl: `/uploads/${uploadedFile.filename}`,
    });
  });
});

export default router;
