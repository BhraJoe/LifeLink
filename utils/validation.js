import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(1, 'Full name is required'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email'),
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .min(10, 'Please enter a valid phone number'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
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
