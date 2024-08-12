import chalk from 'chalk';
import { z } from 'zod';
import { BookRepository } from '../article-management/book.repository';
import { promptForValidInput, readLine } from '../core/input.utils';
import { IInteractor } from '../core/interactor';
import { Menu } from '../core/menu';
import { formatDate, loadPage } from '../core/utils';
import { PoolConnectionFactory } from '../db/mysql-transaction-connection';
import { MemberRepository } from '../member-management/member.repository';
import {
  ITransactionBase,
  RTransaction,
  returnSchema,
  transactionBaseSchema,
} from './models/transaction.model';
import { TransactionRepository } from './transaction.repository';
import { MySql2Database } from 'drizzle-orm/mysql2';

const menu = new Menu([
  { key: '1', label: 'Issue A Book' },
  { key: '2', label: 'Return A Book' },
  { key: '3', label: 'Display Transaction' },
  { key: '4', label: '<Previous Menu>' },
]);
export class TransactionInteractor implements IInteractor {
  constructor(private readonly db: MySql2Database<Record<string, unknown>>) {}
  private repo = new TransactionRepository(this.db);
  private bookRepo = new BookRepository(this.db);
  private memberRepo = new MemberRepository(this.db);

  async showMenu(): Promise<void> {
    let loop: boolean = true;
    while (loop) {
      const op = await menu.show();
      switch (op.toLowerCase()) {
        case '1':
          await issueBook(this.repo, this.bookRepo, this.memberRepo);
          break;
        case '2':
          await returnBook(this.repo, this.bookRepo);
          break;
        case '3':
          await displayTransaction(this.repo);
          break;
        case '4':
          loop = false;
          break;
        default:
          console.log(
            chalk.redBright('\nInvalid Choice! Please select a valid option.\n')
          );
      }
    }
  }
}

async function getTransactionInput(
  bookRepo: BookRepository,
  memberRepo: MemberRepository
): Promise<ITransactionBase> {
  const memberId = await promptForValidInput(
    chalk.cyan('Please enter your member Id: '),
    transactionBaseSchema.shape.memberId,
    undefined,
    memberRepo
  );
  const bookId = await promptForValidInput(
    chalk.cyan('Please enter the Id of the book: '),
    transactionBaseSchema.shape.bookId,
    undefined,
    bookRepo
  );
  const today = new Date();
  const borrowDate = new Date(today);
  const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    memberId: memberId,
    bookId: bookId,
    borrowDate: formatDate(borrowDate),
    dueDate: formatDate(dueDate),
  };
}

async function getReturnBookInputs(
  repo: TransactionRepository
): Promise<RTransaction> {
  while (true) {
    const transactionId = await promptForValidInput(
      chalk.cyan('Enter your transaction Id: '),
      returnSchema.shape.id,
      0
    );
    const checkForTransaction = await repo.getById(transactionId);
    if (!checkForTransaction) {
      console.log(
        chalk.redBright('Transaction Id does not exist. Please try again.')
      );
      continue;
    } else {
      const returnDate = new Date();
      return {
        id: transactionId,
        returnDate: formatDate(returnDate),
      };
    }
  }
}

async function issueBook(
  repo: TransactionRepository,
  bookRepo: BookRepository,
  memberRepo: MemberRepository
) {
  const transaction = await getTransactionInput(bookRepo, memberRepo);
  const createdTransaction = await repo.create(transaction);
  console.table(createdTransaction);
}

async function returnBook(
  repo: TransactionRepository,
  bookRepo: BookRepository
) {
  const transaction = await getReturnBookInputs(repo);
  const returnedBookTransaction = await repo.update(
    transaction.id,
    transaction.returnDate
  );

  if (returnedBookTransaction) {
    //bookRepo.returnBook(returnedBookTransaction.bookId);
    const book = await bookRepo.getById(returnedBookTransaction.bookId);
    console.log(
      chalk.greenBright(
        `Book [${book?.title}] successfully returned on ${returnedBookTransaction.returnDate}!`
      )
    );
  } else {
    console.log(
      chalk.yellowBright(
        'The book for this transaction Id has already been returned.'
      )
    );
  }
}

async function displayTransaction(repo: TransactionRepository) {
  const transactionId = await promptForValidInput(
    chalk.cyan(
      'Enter the transaction Id to display (Press Enter to display all transactions): '
    ),
    z.number(),
    0
  );
  const transaction = await repo.getById(transactionId);
  if (transaction) {
    console.log(chalk.blueBright('Transaction Details:'));
    console.table(transaction);
    if (transaction.returnDate) {
      console.log(
        chalk.blueBright(`The book was returned on: ${transaction.returnDate}`)
      );
    } else {
      console.log(chalk.yellowBright('The book has not been returned yet.'));
    }
  } else if (transactionId === 0) {
    let limit = +(await readLine(
      chalk.cyan('\nEnter the maximum number of records you want to display: ')
    ));
    if (limit === 0) {
      limit = 1;
    }
    let currentPage: number = 0;
    await loadPage(repo, '', limit, currentPage);
  } else {
    console.log(chalk.redBright('No transaction found with the given ID.'));
  }
}
