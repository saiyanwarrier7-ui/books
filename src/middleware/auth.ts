import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../db/index.ts';
import { profiles } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: DecodedIdToken & { dbRole?: string; isDemoAdmin?: boolean };
}

// Require valid authenticated user
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Support demo admin session token for testing in iframe without external popup blocks
  if (token === 'demo-admin-token-hub-2026') {
    req.user = {
      uid: 'admin-super-uid',
      email: 'admin@itstudyhub.edu',
      name: 'Academic Administrator',
      dbRole: 'admin',
      isDemoAdmin: true,
    } as any;
    return next();
  }

  if (token === 'demo-student-token-hub-2026') {
    req.user = {
      uid: 'student-demo-uid',
      email: 'student@itstudyhub.edu',
      name: 'Aditya Sharma',
      dbRole: 'student',
    } as any;
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Check role in profiles table
    try {
      const [userProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, decodedToken.uid));
      if (userProfile) {
        req.user.dbRole = userProfile.role;
      }
    } catch {
      // Ignore profile query failure in middleware
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

// Require Admin role
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  await requireAuth(req, res, async () => {
    const userRole = req.user?.dbRole;
    const isDemoAdmin = req.user?.isDemoAdmin;
    const isAdminEmail = req.user?.email === 'admin@itstudyhub.edu' || req.user?.email?.includes('admin');

    if (userRole === 'admin' || isDemoAdmin || isAdminEmail) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  });
};

// Optional auth for public routes where user context enhances response (e.g. isBookmarked)
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  if (token === 'demo-admin-token-hub-2026') {
    req.user = {
      uid: 'admin-super-uid',
      email: 'admin@itstudyhub.edu',
      name: 'Academic Administrator',
      dbRole: 'admin',
      isDemoAdmin: true,
    } as any;
    return next();
  }
  if (token === 'demo-student-token-hub-2026') {
    req.user = {
      uid: 'student-demo-uid',
      email: 'student@itstudyhub.edu',
      name: 'Aditya Sharma',
      dbRole: 'student',
    } as any;
    return next();
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = decoded;
  } catch {
    // Continue anonymously
  }
  next();
};
