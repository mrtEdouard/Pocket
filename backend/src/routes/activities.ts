// backend/src/routes/activities.ts
import { Router } from "express";
import { query } from "../database.js";
import { activityIdParamsSchema } from "../schemas/activity.js";

export const activitiesRouter = Router();


// Get les activités
activitiesRouter.get("/", async (_request, response) => {
  const result = await query("SELECT * FROM activities");
  response.json(result.rows);
});

// Get l'activité avec son ID
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

activitiesRouter.post("/", async (request, response) => {
    
})