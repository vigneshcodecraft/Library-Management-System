import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IPagedResponse, IPageRequest } from '../core/pagination.response';
import { ITransactionRepository } from '../core/repository';
import { PoolConnectionFactory } from '../db/mysql-transaction-connection';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { PageOption } from '../libs/types';
import { ITransaction, ITransactionBase } from './models/transaction.model';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { BooksTable, TransactionsTable } from '../drizzle/schema';
import { and, count, eq } from 'drizzle-orm';

const {
  generateCountSql,
  generateInsertSql,
  generateSelectSql,
  generateDeleteSql,
  generateUpdateSql,
} = MySqlQueryGenerator;

export class TransactionRepository
  implements ITransactionRepository<ITransactionBase, ITransaction>
{
  constructor(private readonly db: MySql2Database<Record<string, unknown>>) {}

  async create(data: ITransactionBase): Promise<ITransaction> {
    try {
      const transaction: Omit<ITransaction, 'id'> = {
        ...data,
        status: 'Issued',
      };

      const [result] = await this.db
        .insert(TransactionsTable)
        .values(transaction)
        .$returningId();
      const [insertedTransaction] = await this.db
        .select()
        .from(TransactionsTable)
        .where(eq(TransactionsTable.id, result.id));
      //const insertedTransaction = await this.getById(result.insertId);
      const [bookDetails] = await this.db
        .select()
        .from(BooksTable)
        .where(eq(BooksTable.id, insertedTransaction.bookId));

      await this.db
        .update(BooksTable)
        .set({ availableCopies: bookDetails.availableCopies - 1 })
        .where(eq(BooksTable.id, bookDetails.id));

      if (!insertedTransaction) {
        throw new Error('Failed to retrieve the newly inserted transaction');
      }
      return insertedTransaction as ITransaction;
    } catch (error: any) {
      throw new Error(`Insertion failed: ${error.message}`);
    }
  }

  async getById(id: number): Promise<ITransaction | null> {
    try {
      const [result] = await this.db
        .select()
        .from(TransactionsTable)
        .where(eq(TransactionsTable.id, id));
      return (result as ITransaction) || null;
    } catch (e: any) {
      throw new Error(`Selection failed: ${e.message}`);
    }
  }

  async update(
    transactionId: number,
    returnDate: string
  ): Promise<ITransaction | null> {
    try {
      await this.db
        .update(TransactionsTable)
        .set({ returnDate: returnDate, status: 'Returned' })
        .where(
          and(
            eq(TransactionsTable.id, transactionId),
            eq(TransactionsTable.status, 'Issued')
          )
        );
      const [updatedTransaction] = await this.db
        .select()
        .from(TransactionsTable)
        .where(eq(TransactionsTable.id, transactionId));

      const [bookDetails] = await this.db
        .select()
        .from(BooksTable)
        .where(eq(BooksTable.id, updatedTransaction.bookId));

      await this.db
        .update(BooksTable)
        .set({ availableCopies: bookDetails.availableCopies + 1 })
        .where(eq(BooksTable.id, bookDetails.id));

      if (!updatedTransaction) {
        throw new Error('Failed to retrieve the newly updated transaction');
      }
      return updatedTransaction as ITransaction;
    } catch (e: any) {
      throw new Error(`Selection failed: ${e.message}`);
    }
  }

  async list(params: IPageRequest): Promise<IPagedResponse<ITransactionBase>> {
    try {
      const pageOpts: PageOption = {
        offset: params.offset,
        limit: params.limit,
      };

      const transactions = await this.db
        .select()
        .from(TransactionsTable)
        .limit(params.limit)
        .offset(params.offset);

      const [totalTransactionRows] = await this.db
        .select({ count: count() })
        .from(TransactionsTable);

      const totalTransaction = totalTransactionRows.count;
      return {
        items: transactions as ITransaction[],
        pagination: {
          offset: params.offset,
          limit: params.limit,
          total: totalTransaction,
        },
      };
    } catch (e: any) {
      throw new Error(`Listing Transactions failed: ${e.message}`);
    }
  }
}
