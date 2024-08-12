import { z } from 'zod';
import { memberBaseSchema, memberSchema } from './member.model';

const validMemberBaseData = {
  firstName: 'John',
  lastName: 'Doe',
  phone: 1234567890,
  address: 'mangalore',
};

const invalidMemberBaseData = {
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890', // Invalid phone type
  address: 'mangalore',
};

const validMemberData = {
  ...validMemberBaseData,
  id: 1,
};

const invalidMemberData = {
  ...validMemberBaseData,
  id: 'one', // Invalid memberId type
};

describe('memberBaseSchema', () => {
  test('should validate valid member base data', () => {
    expect(() => memberBaseSchema.parse(validMemberBaseData)).not.toThrow();
  });

  test('should invalidate invalid member base data', () => {
    expect(() => memberBaseSchema.parse(invalidMemberBaseData)).toThrow(
      z.ZodError
    );
  });
});

describe('memberSchema', () => {
  test('should validate valid member data', () => {
    expect(() => memberSchema.parse(validMemberData)).not.toThrow();
  });

  test('should invalidate invalid member data', () => {
    expect(() => memberSchema.parse(invalidMemberData)).toThrow(z.ZodError);
  });
});
