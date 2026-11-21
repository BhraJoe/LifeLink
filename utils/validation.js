import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

export const sanitizePhoneNumber = (value) => {
  const input = String(value ?? '').trim();
  if (input.startsWith('+')) {
    return `+${input.slice(1).replace(/\D/g, '')}`.slice(0, 13);
  }
  return input.replace(/\D/g, '').slice(0, 12);
};

export const sanitizeDigits = (value, maxLength = 3) =>
  String(value ?? '').replace(/\D/g, '').slice(0, maxLength);

export const sanitizeName = (value) =>
  String(value ?? '').replace(/[^a-zA-Z\s'-]/g, '').replace(/\s+/g, ' ').slice(0, 100);

export const isValidGhanaPhoneNumber = (value) =>
  /^(?:0\d{9}|(?:\+?233)\d{9})$/.test(String(value ?? '').trim());

const ghanaPhoneNumber = z
  .string({ required_error: 'Phone number is required' })
  .regex(/^(?:0\d{9}|(?:\+?233)\d{9})$/, 'Enter 0241234567 or +233241234567');

const personName = z
  .string({ required_error: 'Full name is required' })
  .trim()
  .min(2, 'Full name must contain at least 2 characters')
  .max(100, 'Full name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Full name must contain letters only');

export const signUpSchema = z.object({
  fullName: personName,
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email'),
  phoneNumber: ghanaPhoneNumber,
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

export const editProfileSchema = z.object({
  fullName: personName,
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email'),
  phoneNumber: ghanaPhoneNumber,
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
})
  .refine(
    (data) =>
      data.password === '' ||
      data.password === undefined ||
      data.password.length >= 6,
    { message: 'Password must be at least 6 characters', path: ['password'] }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email'),
});

export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, errors: {}, data: result.data };
  }
  const errors = {};
  for (const issue of result.error.issues) {
    const path = issue.path[0];
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return { success: false, errors, data: {} };
}
