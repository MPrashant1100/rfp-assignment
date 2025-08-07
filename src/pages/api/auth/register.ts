import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error('Define JWT_SECRET in .env.local');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  await dbConnect();

  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: string;
  };
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check for existing user
  if (await User.findOne({ email })) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Hash & store under the `password` field
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, role });

  // Optionally auto-login after register:
  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: '2h',
  });

  return res.status(201).json({
    message: 'Registered successfully',
    token,
    user: { email: user.email, role: user.role },
  });
}
