import chalk from 'chalk';
import { BookRepository } from '../article-management/book.repository';
import { MemberRepository } from '../member-management/member.repository';
import { TransactionRepository } from '../transaction-management/transaction.repository';
import { readChar } from './input.utils';

export const loadPage = async (
  repo: MemberRepository | BookRepository | TransactionRepository,
  search: string,
  limit: number,
  currentPage: number
) => {
  const members = await repo.list({
    search: search || undefined,
    limit: limit,
    offset: currentPage * limit,
  });
  if (members.items.length > 0) {
    const totalPages = Math.ceil(members.pagination.total / limit);
    console.log(`\t\t\tPage ${currentPage + 1} of ${totalPages}\n`);
    console.table(members.items);
    const hasPreviousPage: boolean = currentPage > 0;
    const hasNextPage: boolean =
      members.pagination.offset + members.pagination.limit <
      members.pagination.total;

    if (hasPreviousPage) {
      console.log(chalk.blue('Press "←" : Previous Page'));
    }
    if (hasNextPage) {
      console.log(chalk.blue('Press "→" : Next Page'));
    }
    if (hasPreviousPage || hasNextPage) {
      console.log(chalk.yellow('Press "q" to Quit'));
      const askChoice = async () => {
        const key: any = await readChar('');
        const op = key.toString('utf-8');
        console.log(op, '\n\n');
        if (op === '\u001b[D' && hasPreviousPage) {
          currentPage--;
          await loadPage(repo, search, limit, currentPage);
        } else if (op === '\u001b[C' && hasNextPage) {
          currentPage++;
          await loadPage(repo, search, limit, currentPage);
        } else if (op !== 'q' && op !== 'Q') {
          console.log(chalk.red('\nInvalid Choice:\n'));
          await askChoice();
        }
      };
      await askChoice();
    }
  } else {
    console.log(chalk.red('\nNo data available to display at the moment.'));
  }
};

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
