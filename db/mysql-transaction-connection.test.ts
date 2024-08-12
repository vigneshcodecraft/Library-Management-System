import 'dotenv/config';
import { IBook } from '../article-management/models/book.model';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { WhereExpression } from '../libs/types';
import { AppEnvs } from '../read-env';
import { LibraryDataset } from './library-dataset';
import { TransactionDatabase } from './library-db';
import { PoolConnectionFactory } from './mysql-transaction-connection';

describe('Test blocks for the Transaction connection', () => {
  let factory: PoolConnectionFactory;
  let db: TransactionDatabase<LibraryDataset>;
  beforeEach(() => {
    factory = new PoolConnectionFactory({
      DbURL: AppEnvs.DATABASE_URL,
    });
    db = new TransactionDatabase(factory);
  });
  //test('Tests for checking whether the connection is valid', () => {});

  test('Tests for the select query', async () => {
    const selectQuery = await db.select('books', [], {});
    const whereCondition: WhereExpression<IBook> = {
      title: {
        op: 'IN',
        value: {
          tableName: 'books',
          row: ['title'],
          where: {
            OR: [
              {
                title: {
                  op: 'NOT IN',
                  value: ['A Book on C', 'Programming in C'],
                },
              },
              {
                author: {
                  op: 'STARTS_WITH',
                  value: 'Man',
                },
              },
            ],
          },
        },
      },
    };
    console.log(MySqlQueryGenerator.generateWhereClauseSql(whereCondition));
    const selectQuery1 = await db.select('books', ['title'], whereCondition);
    console.log(selectQuery1);
  });
});
