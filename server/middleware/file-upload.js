const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createHttpError = require('http-errors');

// Configure allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOADS_DIR = './uploads/images';

// Create storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(createHttpError(400, 'Only JPEG, JPG, and PNG images are allowed'));
  }
  cb(null, true);
};

// Configure multer instance
const fileUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Limit to single file upload
  }
});

// Middleware to handle upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(createHttpError(400, 'File size too large. Maximum 5MB allowed'));
    }
    return next(createHttpError(400, 'File upload error'));
  } else if (err) {
    return next(err);
  }
  next();
};

module.exports = {
  singleUpload: (fieldName) => [
    fileUpload.single(fieldName),
    handleUploadErrors
  ],
  getFilePath: (req) => req.file ? path.join(UPLOADS_DIR, req.file.filename) : null
};