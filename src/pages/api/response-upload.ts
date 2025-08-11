// src/pages/api/response-upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import upload from '@/lib/multer';
import { withRole } from '@/lib/auth';
import { uploadBufferToCloudinary, cloudinaryFolders } from '@/lib/cloudinary';

export const config = { api: { bodyParser: false } };

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res as any, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

const handler = async (req: any, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    await runMiddleware(req, res, upload.single('file'));
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const size = req.file.size ?? req.file.buffer?.length ?? 0;
    if (!size) return res.status(400).json({ message: 'Uploaded file is empty' });

    const { url } = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname,
      cloudinaryFolders.responses,
      req.file.mimetype
    );

    return res.status(200).json({ message: 'File uploaded', filePath: url, bytes: size });
  } catch (err: any) {
    return res.status(500).json({ message: 'Upload failed', detail: err?.message || String(err) });
  }
};

export default withRole(handler, ['Supplier']);
