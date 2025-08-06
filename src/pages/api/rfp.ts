import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import RFP from '../../models/RFP';
// import User from '../../models/User';
import User from '@/models/User';
import { withRole, verifyToken } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  if (req.method === 'POST') {
    // Only Buyer can create
    return withRole(async (req: any, res: NextApiResponse) => {
      const { title, description, file } = req.body;
      if (!title || !description || !file) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const user = req.user;
      const rfp = await RFP.create({
        title,
        description,
        file,
        status: 'Draft',
        createdBy: user.userId,
      });
      res.status(201).json({ message: 'RFP created', rfp });
    }, ['Buyer'])(req, res);
  } else if (req.method === 'GET') {
    // List all RFPs
    const rfps = await RFP.find().populate('createdBy', 'email role');
    res.status(200).json({ rfps });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}