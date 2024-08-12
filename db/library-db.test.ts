import 'dotenv/config';
import { beforeEach, describe, test } from 'vitest';
import { IBook } from '../article-management/models/book.model';
import { MySqlQueryGenerator } from '../libs/mysql-query-generator';
import { WhereExpression } from '../libs/types';
import { AppEnvs } from '../read-env';
import { LibraryDataset } from './library-dataset';
import { MySQLDatabase } from './library-db';
import { MySQLAdapter } from './mysqldb';

describe.skip('Test blocks for all the queries', async () => {
  let adapter: MySQLAdapter;
  let db: MySQLDatabase<LibraryDataset>;
  beforeEach(() => {
    adapter = new MySQLAdapter({
      DbURL: AppEnvs.DATABASE_URL,
    });
    db = new MySQLDatabase(adapter);
  });

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

  test.skip('Tests for the insert query', async () => {
    const insertingValues: Omit<IBook, 'id'> = {
      title: 'The Mysterious Island',
      author: 'Jules Verne',
      publisher: 'Penguin Classics',
      genre: 'Adventure',
      isbnNo: '9780140446029',
      pages: 320,
      totalCopies: 15,
      availableCopies: 15,
    };
    const insertQuery = await db.insert('books', insertingValues);
    console.log(insertQuery);
  });

  test.skip('Tests for the delete query', async () => {
    const whereCondition: WhereExpression<IBook> = {
      title: {
        op: 'EQUALS',
        value: 'This has been Changed',
      },
      id: {
        op: 'EQUALS',
        value: 179,
      },
    };
    const deleteQuery = await db.delete('books', whereCondition);
    console.log(deleteQuery);
  });

  test.skip('Tests for the update query', async () => {
    const setValues: Partial<IBook> = {
      title: 'The Mysterious Island-Changed',
    };
    const whereCondition: WhereExpression<IBook> = {
      title: {
        op: 'EQUALS',
        value: 'The Mysterious Island',
      },
      author: {
        op: 'EQUALS',
        value: 'Jules Verne',
      },
    };
    const updateQuery = await db.update('books', setValues, whereCondition);
    console.log(updateQuery);
  });

  test.skip('Tests for the count query', async () => {
    const countQuery = await db.count('books', {});
    console.log(countQuery);
  });
});
