import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id?: string; sub?: string };
    const userId = decoded.id ?? decoded.sub;

    if (!userId) {
      return res.status(401).json({ message: 'Token payload missing user id' });
    }

    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};