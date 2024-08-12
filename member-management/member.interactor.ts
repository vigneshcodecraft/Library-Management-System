import chalk from 'chalk';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { z } from 'zod';
import { promptForValidInput, readLine } from '../core/input.utils';
import { IInteractor } from '../core/interactor';
import { Menu } from '../core/menu';
import { loadPage } from '../core/utils';
import { MemberRepository } from './member.repository';
import { IMemberBase, memberBaseSchema } from './models/member.model';

const searchSchema = z
  .string()
  .min(2, { message: 'Name must be at least 2 characters long' })
  .regex(/^[a-zA-Z\s]+$/, {
    message: 'Name must contain only alphabetic characters',
  });

const menu = new Menu([
  { key: '1', label: 'Add Member' },
  { key: '2', label: 'Edit Member' },
  { key: '3', label: 'Search Member' },
  { key: '4', label: 'Delete Member' },
  { key: '5', label: 'Display Member' },
  { key: '6', label: '<Previous Menu>' },
]);
export class MemberInteractor implements IInteractor {
  constructor(private readonly db: MySql2Database<Record<string, unknown>>) {}
  private repo = new MemberRepository(this.db);
  async showMenu(): Promise<void> {
    let loop: boolean = true;
    while (loop) {
      const op = await menu.show();
      switch (op.toLowerCase()) {
        case '1':
          await addMember(this.repo);
          break;
        case '2':
          await editMember(this.repo);
          break;
        case '3':
          await searchMember(this.repo);
          break;
        case '4':
          await deleteMember(this.repo);
          break;
        case '5':
          await displayMembers(this.repo);
          break;
        case '6':
          loop = false;
          break;
        default:
          chalk.redBright('\nInvalid Choice! Please select a valid option.\n');
      }
    }
  }
}

async function getMemberInput(
  existingData?: IMemberBase
): Promise<IMemberBase> {
  const firstName = await promptForValidInput(
    chalk.cyan(
      `Please enter First Name${
        existingData?.firstName ? ` (${existingData.firstName})` : ''
      }: `
    ),
    memberBaseSchema.shape.firstName,
    existingData?.firstName
  );
  const lastName = await promptForValidInput(
    chalk.cyan(
      `Please enter Last Name${
        existingData?.lastName ? ` (${existingData.lastName})` : ''
      }: `
    ),
    memberBaseSchema.shape.lastName,
    existingData?.lastName
  );
  const phone = await promptForValidInput(
    chalk.cyan(
      `Please enter Phone Number${
        existingData?.phone ? ` (${existingData.phone})` : ''
      }: `
    ),
    memberBaseSchema.shape.phone,
    existingData?.phone
  );

  const address = await promptForValidInput(
    chalk.cyan(
      `Please provide your address${
        existingData?.address ? ` (${existingData.address})` : ''
      }: `
    ),
    memberBaseSchema.shape.address,
    existingData?.address
  );
  return {
    firstName: firstName || '',
    lastName: lastName || '',
    phone: phone || 0,
    address: address || '',
  };
}
async function addMember(repo: MemberRepository) {
  const member: IMemberBase = await getMemberInput();
  const createdMember = await repo.create(member);
  console.log(chalk.greenBright('\nMember added successfully!\n'));
  console.table(createdMember);
}
async function deleteMember(repo: MemberRepository) {
  const id = +(await readLine(
    chalk.cyan('\nPlease enter the ID of the member you wish to delete: ')
  ));
  const deletedMember = await repo.delete(id);
  if (deletedMember) {
    console.log(chalk.greenBright('\nMember successfully deleted:\n'));
    console.table(deletedMember);
  } else {
    console.log(chalk.redBright('\nNo member found with the given ID.\n'));
  }
}

async function editMember(repo: MemberRepository) {
  const id = +(await readLine(
    chalk.cyan('\nPlease enter the ID of the member you wish to edit : ')
  ));
  const existingMember = await repo.getById(id);

  if (!existingMember) {
    console.log(
      chalk.redBright(
        '\nMember not found. Please check the ID and try again.\n'
      )
    );
    return;
  }

  console.log(chalk.blueBright('\nExisting Member details:'));
  console.table(existingMember);

  const updatedData = await getMemberInput(existingMember);
  const updatedMember = await repo.update(id, updatedData);

  if (updatedMember) {
    console.log(chalk.greenBright('\nMember updated successfully!\n'));
    console.table(updatedMember);
  } else {
    console.log(
      chalk.redBright('\nFailed to update member. Please try again.\n')
    );
  }
}

async function displayMembers(repo: MemberRepository) {
  let limit = +(await readLine(
    chalk.cyan('\nEnter the maximum number of records you want to display: ')
  ));
  if (limit === 0) {
    limit = 1;
  }
  let currentPage: number = 0;
  await loadPage(repo, '', limit, currentPage);
  /*const members = (await repo.list({ limit: 100, offset: 0 })).items;
  if (members.length === 0) {
    console.log('Member not found');
  } else {
    console.table(members);
  }*/
}
async function searchMember(repo: MemberRepository) {
  const search = await promptForValidInput(
    chalk.cyan(
      '\nEnter the First Name/Last Name of the person whom you want to search: '
    ),
    searchSchema,
    ''
  );
  const limit: number = 1;
  let currentPage: number = 0;
  await loadPage(repo, search, limit, currentPage);
}
