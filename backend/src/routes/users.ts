import { Router } from "express";

import { query } from "../database.js";
import { userIdParamsSchema } from "../schemas/user.js";

export const usersRouter = Router();

// GET : Récupère les derniers profils inscrits sans exposer leur email
usersRouter.get("/recent", async (_request, response) => {
  const dbResult = await query(
    `SELECT users.id::text AS id,
            users.name,
            users.created_at AS "createdAt",
            COUNT(activities.id)::integer AS "activityCount"
     FROM users
     LEFT JOIN activities
       ON activities.owner_id = users.id
      AND activities.is_public = TRUE
     GROUP BY users.id
     ORDER BY users.created_at DESC
     LIMIT 3`,
  );

  response.json(dbResult.rows);
});

// GET : Récupère un profil public et ses activités publiques
usersRouter.get("/:id", async (request, response) => {
  const validation = userIdParamsSchema.safeParse(request.params);

  if (!validation.success) {
    response.status(400).json({
      message: "Identifiant utilisateur invalide.",
      errors: validation.error.issues,
    });
    return;
  }

  const { id } = validation.data;
  const profileResult = await query(
    `SELECT users.id::text AS id,
            users.name,
            users.created_at AS "createdAt",
            COUNT(activities.id)::integer AS "activityCount"
     FROM users
     LEFT JOIN activities
       ON activities.owner_id = users.id
      AND activities.is_public = TRUE
     WHERE users.id = $1
     GROUP BY users.id`,
    [id],
  );
  const profile = profileResult.rows[0];

  if (!profile) {
    response.status(404).json({ message: "Profil introuvable." });
    return;
  }

  const activitiesResult = await query(
    `SELECT activities.*,
            users.name AS owner_name,
            FALSE AS is_owned
     FROM activities
     JOIN users ON users.id = activities.owner_id
     WHERE activities.owner_id = $1
       AND activities.is_public = TRUE
     ORDER BY activities.created_at DESC`,
    [id],
  );

  const savedActivitiesResult = await query(
    `SELECT activities.*,
            owners.name AS owner_name,
            FALSE AS is_owned
     FROM saved_activities
     JOIN activities
       ON activities.id = saved_activities.activity_id
     JOIN users AS owners
       ON owners.id = activities.owner_id
     WHERE saved_activities.user_id = $1
       AND activities.owner_id <> $1
       AND activities.is_public = TRUE
     ORDER BY saved_activities.saved_at DESC`,
    [id],
  );

  response.json({
    profile,
    activities: activitiesResult.rows,
    savedActivities: savedActivitiesResult.rows,
  });
});
