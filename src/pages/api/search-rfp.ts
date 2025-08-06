import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import RFP from '../../models/RFP';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: 'Missing search query' });
  }
  const rfps = await RFP.find({ $text: { $search: q } });
  res.status(200).json({ rfps });
}