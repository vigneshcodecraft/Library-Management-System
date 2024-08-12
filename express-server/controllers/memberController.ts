import { Request, Response } from 'express';
import { MemberRepository } from '../../member-management/member.repository';
import { IMemberBase } from '../../member-management/models/member.model';
import mysql from 'mysql2/promise';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import { AppEnvs } from '../../read-env';

export const pool = mysql.createPool(AppEnvs.DATABASE_URL);
export const db: MySql2Database<Record<string, never>> = drizzle(pool);

const memberRepo = new MemberRepository(db);

export const getMemberByIdHandler = async (
  request: Request,
  response: Response
) => {
  const memberId = Number(request.params.id);
  if (isNaN(memberId)) {
    return response.status(400).json({ error: 'Invalid Member ID' });
  }

  try {
    const member = await memberRepo.getById(memberId);
    if (member) {
      response.status(200).json(member);
    } else {
      response.status(404).json({ error: 'Member not found' });
    }
  } catch (error) {
    console.error('Error retrieving member:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const listMembersHandler = async (
  request: Request,
  response: Response
) => {
  const search = (request.query.search as string) || '';
  const limit = Number(request.query.limit) || 10;
  const offset = Number(request.query.offset) || 0;

  try {
    const members = await memberRepo.list({
      search: search,
      limit: limit,
      offset: offset,
    });
    response.status(200).json(members);
  } catch (error) {
    console.error('Error listing members:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createMemberHandler = async (
  request: Request,
  response: Response
) => {
  try {
    const memberData: IMemberBase = request.body;
    const result = await memberRepo.create(memberData);

    response.status(201).json({ message: 'Member Created', result });
  } catch (error) {
    console.error('Error creating member:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateMemberHandler = async (
  request: Request,
  response: Response
) => {
  const memberId = Number(request.params.id);
  if (isNaN(memberId)) {
    return response.status(400).json({ error: 'Invalid Member ID' });
  }

  try {
    const memberData: IMemberBase = request.body;
    const result = await memberRepo.update(memberId, memberData);
    if (result) {
      response.status(200).json({ message: 'Member Updated' });
    } else {
      response.status(404).json({ error: 'Member not found' });
    }
  } catch (error) {
    console.error('Error updating member:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteMemberHandler = async (
  request: Request,
  response: Response
) => {
  const memberId = Number(request.params.id);
  if (isNaN(memberId)) {
    return response.status(400).json({ error: 'Invalid Member ID' });
  }

  try {
    const result = await memberRepo.delete(memberId);
    if (result) {
      response.status(200).json({ message: 'Member Deleted' });
    } else {
      response.status(404).json({ error: 'Member not found' });
    }
  } catch (error) {
    console.error('Error deleting member:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};
