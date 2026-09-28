import { z } from "zod";

export const activityIdParamsSchema = z.object({

    // Valide si id non négatif
  id: z.coerce.number().int().positive(),
});



export const createActivityBodySchema = z
  .strictObject({

    // L'id de l'owner doit être positif
    ownerId: z.number().int().positive(),

    // titre min 1 max 150 caractères
    title: z.string().trim().min(1).max(150),

    // description min 1 
    description: z.string().trim().min(1),

    // age min et max minimum 0
    minAge: z.number().int().min(0),
    maxAge: z.number().int().min(0),

    // nb d'enfants min & max positif 
    minChildren: z.number().int().positive(),
    maxChildren: z.number().int().positive(),

    // durée d'acti positive 
    durationMinutes: z.number().int().positive(),

    
    locationType: z.enum(["indoor", "outdoor", "both"]),
    energyLevel: z.enum(["low", "medium", "high"]),

    isPublic: z.boolean().default(false),
  })
  .refine((data) => data.maxAge >= data.minAge, {
    message: "L’âge maximum doit être supérieur ou égal à l’âge minimum.",
    path: ["maxAge"],
  })
  .refine((data) => data.maxChildren >= data.minChildren, {
    message:
      "Le nombre maximum d’enfants doit être supérieur ou égal au minimum.",
    path: ["maxChildren"],
  });