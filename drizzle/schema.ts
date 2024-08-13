import {
  bigint,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  varchar,
} from 'drizzle-orm/mysql-core';

export const BooksTable = mysqlTable('books', {
  id: serial('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 100 }).notNull(),
  author: varchar('author', { length: 150 }).notNull(),
  publisher: varchar('publisher', { length: 50 }).notNull(),
  genre: varchar('genre', { length: 31 }).notNull(),
  isbnNo: varchar('isbnNo', { length: 31 }).unique().notNull(),
  pages: int('pages').notNull(),
  totalCopies: int('totalCopies').notNull(),
  availableCopies: int('availableCopies').notNull(),
});

export const MembersTable = mysqlTable('members', {
  id: serial('id').primaryKey().autoincrement(),
  firstName: varchar('firstName', { length: 50 }).notNull(),
  lastName: varchar('lastName', { length: 50 }).notNull(),
  phone: bigint('phone', { mode: 'number' }).unique().notNull(),
  address: varchar('address', { length: 100 }).notNull(),
  password: varchar('password', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  role: mysqlEnum('role', ['admin', 'user']).default('user'),
  refreshToken: varchar('refreshToken', { length: 256 }).unique(),
});

export const TransactionsTable = mysqlTable('transactions', {
  id: serial('id').primaryKey().autoincrement(),
  bookId: int('bookId')
    .notNull()
    .references(() => BooksTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  memberId: int('memberId')
    .notNull()
    .references(() => MembersTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  borrowDate: varchar('borrowDate', { length: 10 }).notNull(),
  dueDate: varchar('dueDate', { length: 15 }).notNull(),
  status: varchar('status', { length: 15 }).notNull(),
  returnDate: varchar('returnDate', { length: 10 }),
});
