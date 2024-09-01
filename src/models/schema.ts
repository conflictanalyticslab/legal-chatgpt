import { metadata } from "@/app/layout";
import { validEmailRegex } from "@/lib/signup/validEmailRegex";
import { z, ZodType } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(2, "Please enter in a password"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid e2mail address"),
});

export const signupSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .refine((email) => validEmailRegex.test(email), {
        message: "Email must be an institution email",
      }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .refine((password) => /[A-Z]/.test(password), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((password) => /\d/.test(password), {
        message: "Password must contain at least one number",
      }),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const langchainDoc = z.object({
  pageContent: z.string(),
  metadata: z.object({
    chunk: z.number(),
    fileName: z.string(),
    url: z.string(),
  }),
});

export type langchainDocType = z.infer<typeof langchainDoc>;
