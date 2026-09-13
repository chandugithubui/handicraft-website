const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { adminAuth } = require('../middleware/auth');

/*
=====================================
UPLOAD DIRECTORY
=====================================
*/

const uploadDir = path.join(__dirname, '..', 'uploads');

// Make sure uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/*
=====================================
MULTER STORAGE CONFIG
=====================================
*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname).toLowerCase();

    cb(null, uniqueSuffix + ext);
  }
});

/*
=====================================
FILE FILTER
=====================================
*/

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      ),
      false
    );
  }
};

/*
=====================================
MULTER INSTANCE
=====================================
*/

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

/*
=====================================
POST /api/upload
Admin only
Field name: image
=====================================
*/

router.post('/', adminAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {

    // Multer-specific errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File too large. Maximum allowed size is 5 MB.'
        });
      }

      return res.status(400).json({
        message: `Upload error: ${err.message}`
      });
    }

    // File type / custom errors
    if (err) {
      return res.status(400).json({
        message: err.message
      });
    }

    // No file received
    if (!req.file) {
      return res.status(400).json({
        message: 'No image file provided. Use field name "image".'
      });
    }

    // Successful upload
    return res.status(201).json({
      imageUrl: `/uploads/${req.file.filename}`
    });
  });
});

module.exports = router;