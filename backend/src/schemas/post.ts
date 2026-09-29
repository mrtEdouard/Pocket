import { z } from "zod";

export const createPostBodySchema = z.strictObject({
  activityId: z.number().int().positive(),

  content: z
    .string()
    .trim()
    .min(1, "Le texte de la publication est obligatoire.")
    .max(500, "La publication ne peut pas dépasser 500 caractères."),

  imageUrl: z
    .url("L’adresse de l’image est invalide.")
    .max(2048, "L’adresse de l’image est trop longue.")
    .nullable()
    .optional(),
});

export const postIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});