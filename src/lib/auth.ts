import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export function verifyToken(req: NextApiRequest) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export function withRole(handler: NextApiHandler, allowedRoles: string[]) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = verifyToken(req);
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    (req as any).user = user;
    return handler(req, res);
  };
}