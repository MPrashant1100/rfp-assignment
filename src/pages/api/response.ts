import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import Response from '../../models/Response';
import User from '../../models/User';
import { withRole, verifyToken } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  if (req.method === 'POST') {
    // Only Supplier can submit
    return withRole(async (req: any, res: NextApiResponse) => {
      const { rfp, file } = req.body;
      if (!rfp || !file) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const user = req.user;
      const response = await Response.create({
        rfp,
        supplier: user.userId,
        file,
        status: 'Submitted',
      });
      res.status(201).json({ message: 'Response submitted', response });
    }, ['Supplier'])(req, res);
  } else if (req.method === 'GET') {
    // List all responses for a given RFP id
    const { rfp } = req.query;
    if (!rfp) {
      return res.status(400).json({ message: 'Missing rfp id' });
    }
    const responses = await Response.find({ rfp }).populate('supplier', 'email role');
    res.status(200).json({ responses });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}