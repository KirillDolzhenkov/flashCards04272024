import { z } from 'zod'

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const PersonalInfoScheme = z.object({
  avatar: z.unknown().optional().nullable(),
  nickName: z
    .string()
    .min(3, 'Nickname must be at least 3 characters long')
    .max(30, 'Nickname cannot be longer than 30 characters'),
})

export type PersonalInfoFormValue = z.infer<typeof PersonalInfoScheme>

export const ResetPasswordSchema = z
  .object({
    confirmNewPassword: z.string().min(3),
    newPassword: z.string().min(3),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>

export const SignUpSchema = z
  .object({
    confirmPassword: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(3),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }

    return data
  })

export type SignUpFormValues = z.infer<typeof SignUpSchema>

export const ForgotPasswordSchema = z.object({
  email: z.string().nonempty('Required').email(),
})
export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Enter email'),
  password: z.string().min(1, 'Enter password'),
  rememberMe: z.boolean(),
})

export type SignInFormValues = z.infer<typeof SignInSchema>
