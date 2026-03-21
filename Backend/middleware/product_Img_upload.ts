import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request} from 'express';
import fs from 'fs';

// Ensure uploads folder exists
const uploadFolder = 'uploads/';
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// -------- Multer storage configuration --------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder to save files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // unique file name
  }
});

// Optional: file type filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png'];
  if (!allowedTypes.includes(path.extname(file.originalname).toLowerCase())) {
    return cb(new Error('Only [.jpg , .jpeg , or .png] images are allowed'));
  }
  cb(null, true);
};

// Create upload middleware
const upload = multer({ storage, fileFilter,limits: { fileSize: 50 * 1024 * 1024 } });

export default upload