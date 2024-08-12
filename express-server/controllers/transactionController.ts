import { Request, Response } from 'express';
import { TransactionRepository } from '../../transaction-management/transaction.repository';
import { ITransaction } from '../../transaction-management/models/transaction.model';
import mysql from 'mysql2/promise';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import { AppEnvs } from '../../read-env';

export const pool = mysql.createPool(AppEnvs.DATABASE_URL);
export const db: MySql2Database<Record<string, never>> = drizzle(pool);

const transactionRepo = new TransactionRepository(db);

export const getTransactionByIdHandler = async (
  request: Request,
  response: Response
) => {
  const transactionId = request.params.id;
  if (!transactionId) {
    return response.status(400).json({ error: 'Transaction ID is required' });
  }

  try {
    const transaction = await transactionRepo.getById(Number(transactionId));
    if (transaction) {
      response.status(200).json(transaction);
    } else {
      response.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Error handling transaction request:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const listTransactionsHandler = async (
  request: Request,
  response: Response
) => {
  const search = (request.query.search as string) || '';
  const limit = Number(request.query.limit);
  const offset = Number(request.query.offset) || 0;

  try {
    const transactions = await transactionRepo.list({
      search: search,
      limit: limit,
      offset: offset,
    });
    if (transactionRepo) {
      response.status(200).json(transactionRepo);
    } else {
      response.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Error handling transaction request:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const issueBookHandler = async (
  request: Request,
  response: Response
) => {
  try {
    const transaction: ITransaction = request.body;
    const result = await transactionRepo.create(transaction);

    response.status(201).json({ message: 'Book issued successfully', result });
  } catch (error) {
    console.error('Error issuing book:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const returnBookHandler = async (
  request: Request,
  response: Response
) => {
  const transactionId = Number(request.params.id);

  try {
    const returnDate: string = request.body;
    const result = await transactionRepo.update(transactionId, returnDate);
    if (result) {
      response.status(200).json({ message: 'Book returned' });
    } else {
      response.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Error returning book:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};
