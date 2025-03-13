// import { publicEmailRegex } from "@/lib/auth/public-email-regex";
import { publicEmailRegex } from "@/lib/auth/public-email-regex";
import { z } from "zod";
import isMobilePhone from "validator/lib/isMobilePhone";

export const signupSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .refine((email) => !publicEmailRegex.test(email), {
        message: "Email must be an institution email",
      }),
    phone: z.string().refine(isMobilePhone, "Invalid phone number"),
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
