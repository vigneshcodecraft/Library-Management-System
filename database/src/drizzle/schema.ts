import { int, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

// export const UserTable = mysqlTable("employees", {
//   name: varchar("name", { length: 60 }).notNull(),
//   id: serial("id").primaryKey().notNull(),
// });

export const BooksTable = mysqlTable('books', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  author: varchar('author', { length: 150 }).notNull(),
  publisher: varchar('publisher', { length: 100 }).notNull(),
  genre: varchar('genre', { length: 31 }).notNull(),
  isbnNo: varchar('isbnNo', { length: 13 }).notNull(),
  pages: int('pages').notNull(),
  totalCopies: int('totalCopies').notNull(),
  availableCopies: int('availableCopies').notNull(),
});
