import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: 'Login required' });
  }
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: any, decoded: any) => {
      req.user = decoded;
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired' });
        } else if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Invalid token' });
        } else {
          return res
            .status(500)
            .json({ message: 'Failed to authenticate token' });
        }
      }
      next();
    }
  );
};
