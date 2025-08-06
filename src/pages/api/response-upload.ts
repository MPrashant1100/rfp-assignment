import type { NextApiRequest, NextApiResponse } from 'next';
import upload from '../../lib/multer';
import { withRole } from '../../lib/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

const supplierOnly = withRole(async (req: any, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    await runMiddleware(req, res, upload.single('file'));
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // You can save file info to DB here if needed
    res.status(200).json({ message: 'File uploaded', filePath: `/uploads/${req.file.filename}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}, ['Supplier']);

export default supplierOnly;