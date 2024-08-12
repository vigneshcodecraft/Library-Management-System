import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { MemberRepository } from '../../member-management/member.repository';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { AppEnvs } from '../../read-env';

const pool = mysql.createPool(AppEnvs.DATABASE_URL);
const db: MySql2Database<Record<string, never>> = drizzle(pool);

const memberRepo = new MemberRepository(db);

export const handleRefreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  try {
    const foundUser = await memberRepo.getByRefreshToken(refreshToken);

    if (!foundUser) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      (err:any, decoded:any) => {
        if (err || foundUser.email !== (decoded as any).email)
          return res.sendStatus(403);
        const accessToken = jwt.sign(
          { id: foundUser.id, email: foundUser.email },
          process.env.ACCESS_TOKEN_SECRET!,
          { expiresIn: '30s' }
        );

        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.error('Error during token refresh:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
