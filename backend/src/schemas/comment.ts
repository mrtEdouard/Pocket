import { z } from "zod";

export const commentTargetParamsSchema = z.object({
  targetType: z.enum(["activity", "announcement"]),
  targetId: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9-]+$/),
});

export const createCommentBodySchema = z.strictObject({
  content: z.string().trim().min(1).max(500),
});
