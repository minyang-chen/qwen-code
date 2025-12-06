import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/sessionService';
import { userService } from '../services/userService';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { code: 'NO_TOKEN', message: 'Authentication required' } });
    }
    
    const token = authHeader.substring(7);
    const userId = await sessionService.validateSession(token);
    
    if (!userId) {
      return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
    }
    
    const user = await userService.findById(userId);
    req.user = {
      id: user.id,
      username: user.username
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: { code: 'AUTH_ERROR', message: 'Authentication failed' } });
  }
};
