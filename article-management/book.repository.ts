import 'dotenv/config';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { BooksTable } from '../database/src/drizzle/schema';
import { count, eq, like, or } from 'drizzle-orm';
import chalk from 'chalk';
import { IPageRequest, IPagedResponse } from '../core/pagination.response';
import { IRepository } from '../core/repository';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { PageOption, WhereExpression } from '../libs/types';
import { IBook, IBookBase } from './models/book.model';

export class BookRepository implements IRepository<IBookBase, IBook> {
  constructor(private readonly db: MySql2Database<Record<string, unknown>>) {}

  async create(data: IBookBase): Promise<IBook> {
    try {
      const newBookdata: Omit<IBook, 'id'> = {
        ...data,
        availableCopies: data.totalCopies,
      };
      const [queryResult] = await this.db
        .insert(BooksTable)
        .values(newBookdata)
        .$returningId();
      const [insertedBook] = await this.db
        .select()
        .from(BooksTable)
        .where(eq(BooksTable.id, queryResult.id));

      if (!insertedBook) {
        throw new Error('Failed to retrive the newly inserted Book');
      }
      return insertedBook;
    } catch (e: any) {
      throw new Error(`Insertion failed: ${e.message}`);
    }
  }

  async update(id: number, data: IBookBase): Promise<IBook | null> {
    try {
      const existingBook = await this.getById(id);
      if (!existingBook) {
        return null;
      }

      const updatedBook: IBook = {
        ...existingBook,
        ...data,
        availableCopies: data.totalCopies,
      };

      await this.db
        .update(BooksTable)
        .set(updatedBook)
        .where(eq(BooksTable.id, id));

      const editedBook = await this.getById(id);
      if (!editedBook) {
        throw new Error('Failed to retrieve the updated book');
      }
      return editedBook;
    } catch (e: any) {
      throw new Error(`Update failed: ${e.message}`);
    }
  }

  async delete(id: number): Promise<IBook | null> {
    try {
      const existingBook = await this.getById(id);
      if (!existingBook) {
        return null;
      }
      await this.db.delete(BooksTable).where(eq(BooksTable.id, id));
      return existingBook;
    } catch (e: any) {
      throw new Error(`Deletion failed: ${e.message}`);
    }
  }

  async getById(id: number): Promise<IBook | null> {
    try {
      const [result] = await this.db
        .select()
        .from(BooksTable)
        .where(eq(BooksTable.id, id));
      return (result as IBook) || null;
    } catch (e: any) {
      throw new Error(`Selection failed: ${e.message}`);
    }
  }

  async checkBookAvailability(id: number): Promise<boolean> {
    try {
      const existingBook = await this.getById(id);
      if (existingBook && existingBook.availableCopies > 0) {
        return true;
      }
      return false;
    } catch (e: any) {
      throw new Error(`Handling book failed: ${e.message}`);
    }
  }

  async list(params: IPageRequest): Promise<IPagedResponse<IBook>> {
    try {
      const search = params.search?.toLowerCase();
      const whereExpression = search
        ? or(
            like(BooksTable.title, `%${search}%`),
            like(BooksTable.isbnNo, `%${search}%`)
          )
        : undefined;

      const books = await this.db
        .select()
        .from(BooksTable)
        .where(whereExpression)
        .limit(params.limit)
        .offset(params.offset)
        .execute();

      const result = await this.db
        .select({ count: count() })
        .from(BooksTable)
        .where(whereExpression);

      const totalCount = result[0].count;

      return {
        items: books as IBook[],
        pagination: {
          offset: params.offset,
          limit: params.limit,
          total: totalCount,
        },
      };
    } catch (e: any) {
      throw new Error(`Listing books failed: ${e.message}`);
    }
  }
}
