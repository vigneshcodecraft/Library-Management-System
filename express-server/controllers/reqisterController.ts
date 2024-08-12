import { Request, Response } from 'express';
import { MemberRepository } from '../../member-management/member.repository';
import { IMemberBase } from '../../member-management/models/member.model';
import mysql from 'mysql2/promise';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import bcrypt from 'bcrypt';
import { AppEnvs } from '../../read-env';

export const pool = mysql.createPool(AppEnvs.DATABASE_URL);
export const db: MySql2Database<Record<string, never>> = drizzle(pool);

const memberRepo = new MemberRepository(db);

export const handleRegister = async (req: Request, res: Response) => {
  const { firstName, lastName, phone, address, email, password } = req.body;

  if (!firstName || !lastName || !phone || !address || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await memberRepo.getByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const newUser: IMemberBase = {
      firstName,
      lastName,
      phone,
      address,
      email,
      password: hashedPwd,
    };
      
    const createdUser = await memberRepo.create(newUser);

    res
      .status(201)
      .json({ message: `User ${createdUser.email} created successfully!` });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
