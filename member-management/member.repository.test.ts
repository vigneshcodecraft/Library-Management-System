import 'dotenv/config';
import { beforeEach, describe, test } from 'vitest';
import { LibraryDataset } from '../db/library-dataset';
import { MySQLDatabase } from '../db/library-db';
import { MySQLAdapter } from '../db/mysqldb';
import { AppEnvs } from '../read-env';
import { MemberRepository } from './member.repository';
import { IMemberBase } from './models/member.model';

/*describe.skip('Tests for MemberRepository class methods', () => {
  let memberRepository: MemberRepository;
  let data: IMemberBase;
  let db: MySqlDatabase<MySQLLibraryDatset>;

  beforeAll(async () => {
    db = new Database(join(__dirname, './data/dbtest.json'));
    await db.clear();
  });
  beforeEach(async () => {
    memberRepository = new MemberRepository(db);
    data = {
      address: 'Mangalore',
      firstName: 'Shravan',
      lastName: 'Hegde',
      phone: 8792225251,
    };
  });

  test('Tests for creating member', async () => {
    const createdMember = await memberRepository.create(data);
    expect(createdMember).toEqual({
      ...data,
      memberId: 1,
    });

    expect(createdMember).toBeDefined();
  });

  test('Tests for deleting member', async () => {
    const createdMember = await memberRepository.create(data);
    const deletedMember = await memberRepository.delete(createdMember.memberId);
    expect(deletedMember).toEqual(createdMember);
  });

  test('Tests for updating member', async () => {
    const createdMember = await memberRepository.create(data);

    const updatedData: IMemberBase = {
      address: 'Udupi',
      firstName: 'Shravan Kumar',
      lastName: 'Hegde',
      phone: 8792225251,
    };

    const updatedMember = await memberRepository.update(
      createdMember.memberId,
      updatedData
    );
    expect(updatedMember).toEqual({
      ...updatedData,
      memberId: createdMember.memberId,
    });
  });

  test('Tests for getting member by ID', async () => {
    const createdMember = await memberRepository.create(data);

    const retrievedMember = await memberRepository.getById(
      createdMember.memberId
    );
    expect(retrievedMember).toEqual(createdMember);
  });

  test('Tests for listing members', async () => {
    const data1: IMemberBase = {
      address: 'Mangalore',
      firstName: 'Preethesh',
      lastName: 'Devadiga',
      phone: 8792225251,
    };

    const data2: IMemberBase = {
      address: 'Mangalore',
      firstName: 'Vignesh',
      lastName: 'H',
      phone: 9632483331,
    };

    const createdMember1 = await memberRepository.create(data1);
    const createdMember2 = await memberRepository.create(data2);

    const result = await memberRepository.list({
      offset: 0,
      limit: 10,
      search: '',
    });

    expect(result.pagination.total).toBe(5);
  });
});*/
describe.skip('Tests for the mySql Member repository', () => {
  let adapter: MySQLAdapter;
  let repo: MemberRepository;
  let db: MySQLDatabase<LibraryDataset>;
  beforeEach(() => {
    adapter = new MySQLAdapter({
      DbURL: AppEnvs.DATABASE_URL,
    });
    db = new MySQLDatabase(adapter);
    repo = new MemberRepository(db);
  });

  test('Tests for selecting a particular member', async () => {
    const member = await repo.getById(2);
    console.log(member);
  });

  test('Tests for inserting a particular member', async () => {
    const member: IMemberBase = {
      firstName: 'Anup',
      lastName: 'Kumar',
      phone: 7687654345,
      address: 'Haryana,India',
    };
    const insertedMember = await repo.create(member);
    console.log(insertedMember);
  });

  test.skip('Tests for deleting a particular meber', async () => {
    const deletedMember = await repo.delete(181);
    console.log(deletedMember);
  });
});
