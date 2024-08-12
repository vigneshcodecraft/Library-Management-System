import { z } from 'zod';

// interface IMemberBase {
//   firstName: 'string';
//   lastName: 'string';
//   phone: number;
//   membershipDate: Date;
//   booksIssued: string[];
// }

// interface IMember extends IMemberBase {
//   memberId: number;
// }

export const memberBaseSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { message: 'First name must be at least 2 characters long' })
    .regex(/^[a-zA-Z\s]+$/, {
      message: 'First name must contain only alphabetic characters',
    }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: 'Last name must be at least 1 characters long' })
    .regex(/^[a-zA-Z\s]+$/, {
      message: 'Last must contain only alphabetic characters',
    }),
  phone: z
    .number()
    .min(1000000000, { message: 'Phone number must be at least 10 digits' })
    .max(9999999999, { message: 'Phone number cannot exceed 10 digits' })
    .int(),
  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters long'),
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .min(5, { message: 'Email must be at least 5 characters long' })
    .max(255, { message: 'Email must be no longer than 255 characters' }),

  password: z.string(),
});

export const memberSchema = memberBaseSchema.extend({
  id: z
    .number()
    .int({ message: 'ID must be an integer' })
    .positive({ message: 'ID must be a positive integer' }),
  refreshToken: z.union([z.string(), z.null()]),
});

export type IMemberBase = z.infer<typeof memberBaseSchema>;
export type IMember = z.infer<typeof memberSchema>;
