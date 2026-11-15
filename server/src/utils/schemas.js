import { z } from 'zod';

export const usernameSchema = z
  .string({ required_error: 'Username is required' })
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9._]+$/, 'Use only letters, numbers, dots and underscores');

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

const pinSchema = z
  .string({ required_error: 'PIN is required' })
  .regex(/^\d{4,6}$/, 'PIN must be 4–6 digits');

export const registerSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const pinSetupSchema = z
  .object({ pin: pinSchema, confirmPin: z.string().min(1, 'Please confirm your PIN') })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'PINs do not match',
    path: ['confirmPin'],
  });

export const pinVerifySchema = z.object({ pin: pinSchema });

export const pinResetSchema = z
  .object({
    username: z.string().trim().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    pin: pinSchema,
    confirmPin: z.string().min(1, 'Please confirm your PIN'),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'PINs do not match',
    path: ['confirmPin'],
  });

export const changePinSchema = z
  .object({
    currentPin: pinSchema,
    pin: pinSchema,
    confirmPin: z.string().min(1, 'Please confirm your PIN'),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'PINs do not match',
    path: ['confirmPin'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #64748b')
  .optional();

export const accountSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(40, 'Name is too long'),
  type: z.enum(['cash', 'bank', 'upi', 'credit_card', 'wallet', 'other']).default('bank'),
  openingBalance: z.coerce.number().finite().min(-1e9).max(1e9).default(0),
  color: hexColor,
});

export const accountPatchSchema = accountSchema.partial();

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(40, 'Name is too long'),
  type: z.enum(['expense', 'income']),
  color: hexColor,
  icon: z.string().trim().max(8, 'Use a single emoji').optional(),
});

export const categoryPatchSchema = categorySchema.partial();

const isoDate = z
  .string({ required_error: 'Date is required' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must look like YYYY-MM-DD')
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()), 'Invalid date');

export const transactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.coerce.number().positive('Amount must be greater than zero').max(1e9),
  date: isoDate,
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Choose a category'),
  accountId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Choose an account'),
  note: z.string().trim().max(200, 'Note is too long').optional().default(''),
});

export const transactionPatchSchema = transactionSchema.partial();

export function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const error = new Error(first.message);
    error.status = 400;
    error.issues = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw error;
  }
  return result.data;
}
