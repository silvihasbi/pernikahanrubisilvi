import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer disk storage with clean extension detection
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `wedding-${uniqueSuffix}${ext}`);
  },
});

// File filter supporting photos, animated media, videos, and audio
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const mimetype = file.mimetype.toLowerCase();
  
  const isImage = mimetype.startsWith('image/');
  const isVideo = mimetype.startsWith('video/') || ['video/mp4', 'video/webm', 'video/quicktime'].includes(mimetype);
  const isAudio = mimetype.startsWith('audio/') || ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/m4a'].includes(mimetype);

  if (isImage || isVideo || isAudio) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Harap unggah foto, video, atau musik MP3.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB maximum per file (for HD videos & audio)
  },
});
