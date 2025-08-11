import type { NextApiRequest, NextApiResponse } from 'next';
import upload from '@/lib/multer';
import dbConnect from '@/lib/mongodb';
import RFP from '@/models/RFP';
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  await dbConnect();

  try {
    await runMiddleware(req, res, upload.single('file'));
    if (!req.file) return res.status(400).json({ error: 'Missing file' });

    // Safety checks to help debug
    const size = req.file.size ?? req.file.buffer?.length ?? 0;
    if (!size) return res.status(400).json({ error: 'Uploaded file is empty' });

    const { url } = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname,
      cloudinaryFolders.rfps,
      req.file.mimetype
    );

    // Optional versioning
    const { rfpId } = req.body as { rfpId?: string };
    if (rfpId) {
      const rfp = await RFP.findById(rfpId);
      if (!rfp) return res.status(404).json({ error: 'RFP not found' });
      const last = rfp.versions.length ? rfp.versions[rfp.versions.length - 1].version : 0;
      rfp.versions.push({ filePath: url, version: last + 1, uploadedAt: new Date() });
      await rfp.save();
    }

    return res.status(200).json({ message: 'File uploaded', filePath: url, bytes: size });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Upload failed',
      detail: err?.message || String(err),
    });
  }
};

export default withRole(handler, ['Buyer']);
