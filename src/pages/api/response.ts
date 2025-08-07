import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import ResponseModel from '@/models/Response';
import { withRole, verifyToken } from '@/lib/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === 'POST') {
    // Supplier-only submit
    return withRole(async (req2, res2) => {
      const { rfp, file } = req2.body as { rfp?: string; file?: string };
      if (!rfp || !file) {
        return res2.status(400).json({ error: 'Missing required fields' });
      }
      const user = (req2 as any).user;
      const resp = await ResponseModel.create({
        rfp,
        supplier: user.userId,
        file,
        status: 'Submitted',
      });
      return res2.status(201).json({ message: 'Response submitted', response: resp });
    }, ['Supplier'])(req, res);
  }

  if (req.method === 'GET') {
    const tokenData = verifyToken(req);
    if (!tokenData) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { rfp } = req.query as { rfp?: string };
    if (rfp) {
      // Buyer: list all responses for a given RFP
      if (tokenData.role !== 'Buyer') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const responses = await ResponseModel.find({ rfp })
        .populate('supplier', 'email')
        .lean();
      return res.status(200).json({ responses });
    } else {
      // Supplier: list your own responses
      if (tokenData.role !== 'Supplier') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const responses = await ResponseModel.find({ supplier: tokenData.userId })
        .populate('rfp', 'title')
        .lean();
      return res.status(200).json({ responses });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};

export default handler;
