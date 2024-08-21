import { z, ZodType } from "zod";

export const loginSchema: ZodType<{ email: string; password: string }> =
  z.object({
    email: z.string().email(),
    password: z.string().min(1, "Please enter in a password"),
  });

  export const resetPasswordSchema: ZodType<{ email: string }> = z.object({
  email: z.string().email(),
});
