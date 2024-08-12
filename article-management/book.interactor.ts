import chalk from 'chalk';
import { promptForValidInput, readLine } from '../core/input.utils';
import { IInteractor } from '../core/interactor';
import { Menu } from '../core/menu';
import { loadPage } from '../core/utils';
import { PoolConnectionFactory } from '../db/mysql-transaction-connection';

import { MySql2Database } from 'drizzle-orm/mysql2';

import { BookRepository } from './book.repository';
import { IBookBase, bookBaseSchema } from './models/book.model';


const menu = new Menu([
  { key: '1', label: 'Add Book' },
  { key: '2', label: 'Edit Book' },
  { key: '3', label: 'Search Book' },
  { key: '4', label: 'Delete Book' },
  { key: '5', label: 'Display Book' },
  { key: '6', label: '<Previous Menu>' },
]);

export class BookInteractor implements IInteractor {
  constructor(private readonly db: MySql2Database) {}
  private repo = new BookRepository(this.db);
  async showMenu(): Promise<void> {
    let loop: boolean = true;
    while (loop) {
      const op = await menu.show();
      switch (op.toLowerCase()) {
        case '1':
          await addBook(this.repo);
          break;
        case '2':
          await editBook(this.repo);
          break;
        case '3':
          await searchBook(this.repo);
          break;
        case '4':
          await deleteBook(this.repo);
          break;
        case '5':
          await displayBooks(this.repo);
          break;
        case '6':
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

async function getBookInput(existingData?: IBookBase): Promise<IBookBase> {
  const title = await promptForValidInput(
    chalk.cyan(
      `Please enter title${
        existingData?.title ? ` (${existingData.title})` : ''
      }: `
    ),
    bookBaseSchema.shape.title,
    existingData?.title
  );
  const author = await promptForValidInput(
    chalk.cyan(
      `Please enter author${
        existingData?.author ? ` (${existingData.author})` : ''
      }: `
    ),
    bookBaseSchema.shape.author,
    existingData?.author
  );
  const publisher = await promptForValidInput(
    chalk.cyan(
      `Please enter publisher${
        existingData?.publisher ? ` (${existingData.publisher})` : ''
      }: `
    ),
    bookBaseSchema.shape.publisher,
    existingData?.publisher
  );
  const genre = await promptForValidInput(
    chalk.cyan(
      `Please enter genre${
        existingData?.genre ? ` (${existingData.genre})` : ''
      }: `
    ),
    bookBaseSchema.shape.genre,
    existingData?.genre
  );
  const isbnNo = await promptForValidInput(
    chalk.cyan(
      `Please enter ISBN Number${
        existingData?.isbnNo ? ` (${existingData.isbnNo})` : ''
      }: `
    ),
    bookBaseSchema.shape.isbnNo,
    existingData?.isbnNo
  );
  const pages = await promptForValidInput(
    chalk.cyan(
      `Please enter total num of pages${
        existingData?.pages ? ` (${existingData.pages})` : ''
      }: `
    ),
    bookBaseSchema.shape.pages,
    existingData?.pages
  );
  const totalCopies = await promptForValidInput(
    chalk.cyan(
      `Please enter the total num of copies${
        existingData?.totalCopies ? ` (${existingData.totalCopies})` : ''
      }: `
    ),
    bookBaseSchema.shape.totalCopies,
    existingData?.totalCopies
  );

  return {
    title: title || '',
    author: author || '',
    publisher: publisher || '',
    genre: genre || '',
    isbnNo: isbnNo || '',
    pages: pages || 0,
    totalCopies: totalCopies || 0,
  };
}

async function addBook(repo: BookRepository) {
  const book: IBookBase = await getBookInput();
  const createdBook = await repo.create(book);
  console.log(chalk.greenBright('\nBook added successfully!\n'));
  console.table(createdBook);
}

async function editBook(repo: BookRepository) {
  const id = +(await readLine(
    chalk.cyan('\nEnter the ID of the book to edit: ')
  ));
  const existingBook = await repo.getById(id);

  if (!existingBook) {
    console.log(
      chalk.redBright('\nBook not found. Please check the ID and try again.\n')
    );
    return;
  }

  console.log(chalk.blueBright('Existing book details:'));
  console.table(existingBook);

  const updatedData = await getBookInput(existingBook);
  const updatedBook = await repo.update(id, updatedData);

  if (updatedBook) {
    console.log(chalk.greenBright('\nBook updated successfully!\n'));
    console.table(updatedBook);
  } else {
    console.log(chalk.redBright('Failed to update book. Please try again.\n'));
  }
}

async function deleteBook(repo: BookRepository) {
  const id = +(await readLine(
    chalk.cyan('\nEnter the ID of the book to delete: ')
  ));
  const deletedBook = await repo.delete(id);
  if (deletedBook) {
    console.log(chalk.greenBright('\nBook successfully deleted :\n'));
    console.table(deletedBook);
  } else {
    console.log(chalk.redBright('\nNo book found with the given ID.\n'));
  }
}

async function displayBooks(repo: BookRepository) {
  let pageSize: number = +(await readLine(
    chalk.cyan('\nEnter the maximum number of records you want to display: ')
  ));
  if (pageSize === 0) {
    pageSize = 1;
  }
  let currentPage: number = 0;
  await loadPage(repo, '', pageSize, currentPage);
}

async function searchBook(repo: BookRepository) {
  const search = await readLine(
    chalk.cyan(
      '\nEnter the Title/isbnNO of the book which you want to search: ' || ''
    )
  );
  const pageSize = 5;
  let currentPage = 0;
  await loadPage(repo, search, pageSize, currentPage);
}
