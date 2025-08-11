import multer from 'multer';

const storage = multer.memoryStorage();

function fileFilter(_req: any, file: any, cb: any) {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpg',
    'image/jpeg',
  ];
  cb(null, allowed.includes(file.mimetype));
}

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
