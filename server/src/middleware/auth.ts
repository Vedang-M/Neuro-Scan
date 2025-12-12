import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = (req as any).headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return (res as any).status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'patient', // Custom claim for role
    };
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return (res as any).status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user?.role !== role && user?.role !== 'admin') {
      return (res as any).status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};