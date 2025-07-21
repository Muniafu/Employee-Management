const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createHttpError = require('http-errors');

// Create storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uuidv4()}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, JPG or PNG images are allowed'));
  }
  cb(null, true);
};

// Configure multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 
  } // Limit file size to 5MB
});

// Middleware wrapper
const singleUpload = (fieldName) => [
  upload.single(fieldName),
  (err, req, res, next) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(createHttpError(400, 'File size exceeds 5MB limit'));
      }
      return next(createHttpError(400, err.message));
    }
    next();
  }
];

module.exports = { singleUpload };