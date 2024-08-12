import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IPagedResponse, IPageRequest } from '../core/pagination.response';
import { ITransactionRepository } from '../core/repository';
import { PoolConnectionFactory } from '../db/mysql-transaction-connection';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { PageOption } from '../libs/types';
import { ITransaction, ITransactionBase } from './models/transaction.model';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { BookTable, TransactionTable } from '../drizzle/schema';
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
        .insert(TransactionTable)
        .values(transaction)
        .$returningId();
      const [insertedTransaction] = await this.db
        .select()
        .from(TransactionTable)
        .where(eq(TransactionTable.id, result.id));
      //const insertedTransaction = await this.getById(result.insertId);
      const [bookDetails] = await this.db
        .select()
        .from(BookTable)
        .where(eq(BookTable.id, insertedTransaction.bookId));

      await this.db
        .update(BookTable)
        .set({ availableCopies: bookDetails.availableCopies - 1 })
        .where(eq(BookTable.id, bookDetails.id));

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
        .from(TransactionTable)
        .where(eq(TransactionTable.id, id));
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
        .update(TransactionTable)
        .set({ returnDate: returnDate, status: 'Returned' })
        .where(
          and(
            eq(TransactionTable.id, transactionId),
            eq(TransactionTable.status, 'Issued')
          )
        );
      const [updatedTransaction] = await this.db
        .select()
        .from(TransactionTable)
        .where(eq(TransactionTable.id, transactionId));

      const [bookDetails] = await this.db
        .select()
        .from(BookTable)
        .where(eq(BookTable.id, updatedTransaction.bookId));

      await this.db
        .update(BookTable)
        .set({ availableCopies: bookDetails.availableCopies + 1 })
        .where(eq(BookTable.id, bookDetails.id));

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
        .from(TransactionTable)
        .limit(params.limit)
        .offset(params.offset);

      const [totalTransactionRows] = await this.db
        .select({ count: count() })
        .from(TransactionTable);

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
