import { z } from "zod";

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid e2mail address"),
});
