import { Request, Response } from 'express';
import { MemberRepository } from '../../member-management/member.repository';
import { AppEnvs } from '../../read-env';
import mysql from 'mysql2/promise';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';

const pool = mysql.createPool(AppEnvs.DATABASE_URL);
const db: MySql2Database<Record<string, never>> = drizzle(pool);
const memberRepo = new MemberRepository(db);

export const handleLogout = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204);
  }
  const refreshToken = cookies.jwt;

  try {
    const foundUser = await memberRepo.getByRefreshToken(refreshToken);
    if (!foundUser) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      return res.sendStatus(204);
    }

    await memberRepo.clearRefreshToken(foundUser.id);

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
