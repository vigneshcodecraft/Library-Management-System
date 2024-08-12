import chalk from 'chalk';
import { emitKeypressEvents } from 'node:readline';
import { z } from 'zod';
import { BookRepository } from '../article-management/book.repository';
import { MemberRepository } from '../member-management/member.repository';

export const readLine = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const onData = async (key: Buffer) => {
      process.removeListener('data', onData);
      const input = key.toString('utf-8');
      resolve(input.trim());
    };
    process.stdin.addListener('data', onData);
  });
};

export const readChar = (question: string): Promise<string> => {
  process.stdout.write(`${question}\n`);
  return new Promise((resolve) => {
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.setEncoding('utf8');

    const onData = (key: Buffer) => {
      process.stdin.setRawMode(false);
      process.stdin.removeListener('data', onData);
      const char = key.toString('utf-8');
      if (char.charCodeAt(0) === 3) {
        process.exit(0);
      }
      resolve(char);
    };

    process.stdin.addListener('data', onData);
  });
};

export type Repository = BookRepository | MemberRepository;

export async function promptForValidInput<T>(
  question: string,
  schema: z.ZodSchema<T>,
  defaultValue?: T,
  repo?: Repository
): Promise<T> {
  let input;
  do {
    input = await readLine(chalk.yellow(question));
    try {
      if (repo) {
        const id = Number(input);
        const recordExists = await repo.getById(id);
        if (recordExists && repo instanceof BookRepository) {
          console.log(chalk.blue('Book Details'));
          console.table(recordExists);
          const confirmation = await readLine(
            chalk.yellow('Is this the book you are looking for? (yes/no): ')
          );
          if (
            confirmation.toLowerCase() !== 'yes' &&
            confirmation.toLowerCase() !== 'y'
          ) {
            continue;
          }
          const bookAvailable = await repo.checkBookAvailability(id);
          if (!bookAvailable) {
            console.log(
              chalk.red('There are no copies available for this book')
            );
            continue;
          }
        }
        if (!recordExists && !isNaN(Number(input))) {
          console.log(
            chalk.red(
              `${
                repo instanceof MemberRepository ? 'Member' : 'Book'
              } with this particular ID does not exist`
            )
          );
          continue;
        }
      }

      if (!input && defaultValue !== undefined) {
        return defaultValue;
      }
      return schema.parse(
        schema instanceof z.ZodNumber ? Number(input) : input
      );
    } catch (e) {
      if (e instanceof z.ZodError) {
        console.log(chalk.red('Validation error:'), e.errors[0].message);
      } else {
        console.log(chalk.red('An unknown error occurred:'), e);
      }
    }
  } while (true);
}
