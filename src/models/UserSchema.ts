import { z } from "zod";

export const userSchema = z.object({
  email: z.string(),
  prompts_allowed: z.number(),
  prompts_left: z.number(),
  role: z.string(),
  verified: z.boolean(),
});
