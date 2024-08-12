import { ResultSetHeader } from 'mysql2/promise';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { PageOption, WhereExpression } from '../libs/types';
import { PoolConnectionFactory } from './mysql-transaction-connection';
import { MySQLAdapter } from './mysqldb';
const {
  generateCountSql,
  generateInsertSql,
  generateSelectSql,
  generateDeleteSql,
  generateUpdateSql,
} = MySqlQueryGenerator;

export class MySQLDatabase<DS> {
  constructor(private readonly adapter: MySQLAdapter) {}

  async select<T extends keyof DS>(
    tableName: T,
    column: (keyof DS[T])[],
    where: WhereExpression<DS[T]>,
    pageOpts?: PageOption
  ): Promise<DS[T][]> {
    try {
      const { sql, values } = generateSelectSql<DS[T]>(
        tableName as string,
        column,
        where,
        pageOpts
      );

      const result = await this.adapter.runQuery<DS[T][]>(sql, values);
      return result as DS[T][];
    } catch (error) {
      console.error('Error in select query:', error); // Debugging line
      throw new Error(`select query failed!!!!`);
    }
  }

  async insert<T extends keyof DS>(
    tableName: T,
    row: Omit<DS[T], 'id'>
  ): Promise<ResultSetHeader> {
    try {
      const { sql, values } = generateInsertSql<Omit<DS[T], 'id'>>(
        tableName as string,
        row
      );
      const result = await this.adapter.runQuery(sql, values);
      return result as ResultSetHeader;
    } catch (error) {
      console.error(error);
      throw new Error(`Insert query failed!!!!`);
    }
  }

  async update<T extends keyof DS>(
    tableName: T,
    row: Partial<DS[T]>,
    where: WhereExpression<DS[T]>
  ): Promise<ResultSetHeader> {
    try {
      const { sql, values } = generateUpdateSql<DS[T]>(
        tableName as string,
        row,
        where
      );
      const result = await this.adapter.runQuery(sql, values);
      return result as ResultSetHeader;
    } catch (error) {
      console.error(error);
      throw new Error(`Update query failed!!!!`);
    }
  }

  async delete<T extends keyof DS>(
    tableName: T,
    where: WhereExpression<DS[T]>
  ) {
    try {
      const { sql, values } = generateDeleteSql<DS[T]>(
        tableName as string,
        where
      );
      const result = await this.adapter.runQuery(sql, values);
      return result;
    } catch {
      throw new Error(`Delete query failed!!!!`);
    }
  }

  async count<T extends keyof DS>(
    tableName: T,
    where: WhereExpression<DS[T]>
  ): Promise<number> {
    try {
      const { sql, values } = generateCountSql<DS[T]>(
        tableName as string,
        where
      );
      const result = await this.adapter.runQuery(sql, values);
      if (Array.isArray(result)) {
        return result[0].COUNT;
      }
      return 0;
    } catch {
      throw new Error(`Count query failed!!!!`);
    }
  }
}

export class TransactionDatabase<DS> {
  constructor(private readonly factory: PoolConnectionFactory) {}
  async select<T extends keyof DS>(
    tableName: T,
    column: (keyof DS[T])[],
    where: WhereExpression<DS[T]>,
    pageOpts?: PageOption
  ): Promise<DS[T][]> {
    try {
      const { sql, values } = generateSelectSql<DS[T]>(
        tableName as string,
        column,
        where,
        pageOpts
      );

      //const result = await this.adapter.runQuery<DS[T][]>(sql, values);
      const result = (
        await this.factory.acquireTransactionPoolConnection()
      ).query<ResultSetHeader[]>(sql, values);
      return result as Promise<DS[T][]>;
    } catch (error) {
      console.error('Error in select query:', error); // Debugging line
      throw new Error(`select query failed!!!!`);
    }
  }
}
