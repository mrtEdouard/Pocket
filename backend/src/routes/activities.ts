// backend/src/routes/activities.ts
import { Router } from "express";
import { query } from "../database.js";
import {
  activityIdParamsSchema,
  activityOwnerIdParamsSchema,
  createActivityBodySchema,
} from "../schemas/activity.js";

export const activitiesRouter = Router();


// GET : Récupère toutes les activités
activitiesRouter.get("/", async (_request, response) => {
  const result = await query("SELECT * FROM activities");
  response.json(result.rows);
});

// GET : Récupère les activités d'un utilisateur avec son ID
activitiesRouter.get("/owner/:ownerId", async (request, response) => {
  const validation = activityOwnerIdParamsSchema.safeParse(request.params);

  if (!validation.success) {
    response.status(400).json({
      message: "Identifiant de l'utilisateur invalide.",
      errors: validation.error.issues,
    });
    return;
  }

  const { ownerId } = validation.data;

  const dbResult = await query(
    "SELECT * FROM activities WHERE owner_id = $1",
    [ownerId],
  );

  response.json(dbResult.rows);
});

// GET : Récupère une activité avec son ID
activitiesRouter.get("/:id", async (request, response) => {
  const validation = activityIdParamsSchema.safeParse(request.params);

  if (!validation.success) {
    response.status(400).json({
      message: "Identifiant invalide.",
      errors: validation.error.issues,
    });
    return;
  }

  const { id } = validation.data;

  const dbResult = await query(
    "SELECT * FROM activities WHERE id = $1",
    [id],
  );

  const activity = dbResult.rows[0];

  if (!activity) {
    response.status(404).json({
      message: "Activité introuvable.",
    });
    return;
  }

  response.json(activity);
});

// POST : Crée une activité
activitiesRouter.post("/", async (request, response) => {
    const validation = createActivityBodySchema.safeParse(request.body);

    if (!validation.success){
        response.status(400).json({
            message: "Données invalides.",
            errors: validation.error.issues,
        })
        return;
    }

    const activityData = validation.data;

    const dbResult = await query(
  `INSERT INTO activities (
    owner_id,
    title,
    description,
    min_age,
    max_age,
    min_children,
    max_children,
    duration_minutes,
    location_type,
    energy_level,
    is_public
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING *`,
  [
    activityData.ownerId,
    activityData.title,
    activityData.description,
    activityData.minAge,
    activityData.maxAge,
    activityData.minChildren,
    activityData.maxChildren,
    activityData.durationMinutes,
    activityData.locationType,
    activityData.energyLevel,
    activityData.isPublic,
  ],
);
    const createdActivity = dbResult.rows[0];

    response.status(201).json(createdActivity);
})
