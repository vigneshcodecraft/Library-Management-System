import 'dotenv/config';
import { LibraryDataset } from '../db/library-dataset';
import { MySQLDatabase } from '../db/library-db';
import { PoolConnectionFactory } from '../db/mysql-transaction-connection';
import { MySQLAdapter } from '../db/mysqldb';
import { AppEnvs } from '../read-env';
import { BookRepository } from './book.repository';
import { IBookBase } from './models/book.model';

describe.skip('Tests for the mySql Book repository', () => {
  let adapter: MySQLAdapter;
  let repo: BookRepository;
  let db: MySQLDatabase<LibraryDataset>;
  beforeEach(() => {
    adapter = new MySQLAdapter({
      DbURL: AppEnvs.DATABASE_URL,
    });
    db = new MySQLDatabase(adapter);
    repo = new BookRepository(db);
  });
  test.skip('Tests for selecting a particular book', async () => {
    const book = await repo.getById(100);
    console.log(book);
  });

  test.skip('Tests for inserting a particular book', async () => {
    const book: IBookBase = {
      title: 'A Book on Data Structures',
      author: 'Al Kelley, Ira Pohl DS',
      publisher: 'Benjamin-Cummings Publishing Company',
      genre: 'Computers',
      isbnNo: '9780805300123',
      pages: 568,
      totalCopies: 15,
    };
    const insertedBook = await repo.create(book);
    console.log(insertedBook);
  });

  test.skip('Tests for deleting a particular book', async () => {
    const deletdeBook = await repo.delete(181);
    console.log(deletdeBook);
  });

  test.skip('Tests for handling the particular book', async () => {
    const bool = await repo.handleBook(180);
    console.log(bool);
  });

  test.skip('Tests for deleting the particular book', async () => {
    const book = await repo.returnBook(180);
  });

  test.skip('Tests for the list', () => {});
});

describe('Tests for book repository after applying the connection', () => {
  let factory: PoolConnectionFactory;
  beforeEach(() => {
    factory = new PoolConnectionFactory({
      DbURL: AppEnvs.DATABASE_URL,
    });
  });
  test.skip('Tests to handle the book', async () => {
    const repo = new BookRepository(factory);
    const res = await repo.handleBook(187);
    console.log(res);
  });

  test('Tests to return the book', async () => {
    const repo = new BookRepository(factory);
    const res = await repo.returnBook(187);
    console.log(res);
  });

  test('Tests for the list', async () => {
    const repo = new BookRepository(factory);
    const res = await repo.list({ search: '', limit: 5, offset: 0 });
    console.log(res);
  });
});
