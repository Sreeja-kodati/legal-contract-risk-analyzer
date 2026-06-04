const express = require('express');
const multer = require('multer');
const path = require('path');
const { compareContracts } = require('../controllers/compareController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve(__dirname, '../uploads');
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
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter,
});

const router = express.Router();

router.post('/compare', upload.array('contracts', 2), compareContracts);

module.exports = router;
