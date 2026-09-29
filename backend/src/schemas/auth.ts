import { z } from "zod";


export const registerBodySchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(12).max(128),
});

export const loginBodySchema = z.strictObject({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(128),
});