import { Request, Response } from 'express';
import { BookRepository } from '../../article-management/book.repository';
import { IBook } from '../../article-management/models/book.model';
import mysql from 'mysql2/promise';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import { AppEnvs } from '../../read-env';

export const pool = mysql.createPool(AppEnvs.DATABASE_URL);
export const db: MySql2Database<Record<string, never>> = drizzle(pool);

const bookRepo = new BookRepository(db);

export const getBookByIdHandler = async (
  request: Request,
  response: Response
) => {
  const bookId = request.params.id;
  if (!bookId) {
    return response.status(400).json({ error: 'Book ID is required' });
  }

  try {
    const book = await bookRepo.getById(Number(bookId));
    if (book) {
      response.status(200).json(book);
    } else {
      response.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    console.error('Error handling book request:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const listBooksHandler = async (
  request: Request,
  response: Response
) => {
  const search = (request.query.search as string) || '';
  const limit = Number(request.query.limit);
  const offset = Number(request.query.offset) || 0;

  try {
    const books = await bookRepo.list({
      search: search,
      limit: limit,
      offset: offset,
    });
    if (books) {
      response.status(200).json(books);
    } else {
      response.status(404).json({ error: 'Books not found' });
    }
  } catch (error) {
    console.error('Error handling book request:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createBookHandler = async (
  request: Request,
  response: Response
) => {
  try {
    const book: IBook = request.body;
    const result = await bookRepo.create(book);

    response.status(201).json({ message: 'Book Created', result });
  } catch (error) {
    console.error('Error inserting book:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateBookHandler = async (
  request: Request,
  response: Response
) => {
  const bookId = Number(request.params.id);
  try {
    const book: IBook = request.body;
    const result = await bookRepo.update(bookId, book);
    if (result) {
      response.status(200).json({ message: 'Book Updated' });
    } else {
      response.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    console.error('Error updating book:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteBookHandler = async (
  request: Request,
  response: Response
) => {
  const bookId = Number(request.params.id);
  try {
    const result = await bookRepo.delete(bookId);
    if (result) {
      response.status(200).json({ message: 'Book Deleted' });
    } else {
      response.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};
