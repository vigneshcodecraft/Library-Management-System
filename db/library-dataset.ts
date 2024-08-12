import { IBook } from '../article-management/models/book.model';
import { IMember } from '../member-management/models/member.model';
import { ITransaction } from '../transaction-management/models/transaction.model';

export interface LibraryDataset {
  books: IBook;
  members: IMember;
  transactions: ITransaction;
}
