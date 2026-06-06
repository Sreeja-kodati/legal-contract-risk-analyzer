const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadHandler } = require('../controllers/uploadController');

const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('[UploadRoutes] Created uploads directory at:', uploadDir);
  }
} catch (error) {
  console.error('[UploadRoutes] Failed to create uploads directory:', error.message);
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedMimeTypes = ['application/pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) || fileExtension !== '.pdf') {
    return cb(new Error('Only PDF files are allowed')); 
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

const router = express.Router();

router.post('/upload', upload.single('file'), uploadHandler);

router.use((err, req, res, next) => {
  if (!err) {
    return next();
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File size limit exceeded' });
  }

  res.status(400).json({ error: err.message || 'File upload failed' });
});

module.exports = router;
