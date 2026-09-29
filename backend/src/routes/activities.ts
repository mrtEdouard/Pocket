// backend/src/routes/activities.ts
import { Router } from "express";
import { query } from "../database.js";
import {
  activityIdParamsSchema,
  activityOwnerIdParamsSchema,
  createActivityBodySchema,
  updateActivityBodySchema,
} from "../schemas/activity.js";
import { authenticate } from "../middleware/authenticate.js";
export const activitiesRouter = Router();

// GET : Récupère les activités publiques pour le fil d'accueil
activitiesRouter.get("/", async (_request, response) => {
  const result = await query(
    `SELECT activities.*, users.name AS owner_name, FALSE AS is_owned
     FROM activities
     JOIN users ON users.id = activities.owner_id
     WHERE activities.is_public = TRUE
     ORDER BY activities.created_at DESC`,
  );

  response.json(result.rows);
});

// GET : Récupère la valise à activités de l'utilisateur connecté
activitiesRouter.get("/mine", authenticate, async (request, response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    response.status(401).json({ message: "Authentification requise." });
    return;
  }

  const dbResult = await query(
    `SELECT activities.*,
            users.name AS owner_name,
            (activities.owner_id = $1) AS is_owned
     FROM activities
     JOIN users ON users.id = activities.owner_id
     LEFT JOIN saved_activities
       ON saved_activities.activity_id = activities.id
      AND saved_activities.user_id = $1
     WHERE activities.owner_id = $1
        OR saved_activities.user_id = $1
     ORDER BY activities.created_at DESC`,
    [userId],
  );

  response.json(dbResult.rows);
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
// POST : Crée une activité pour l'utilisateur connecté
activitiesRouter.post("/", authenticate, async (request, response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    response.status(401).json({
      message: "Authentification requise.",
    });
    return;
  }

  const validation = createActivityBodySchema.safeParse(request.body);

  if (!validation.success) {
    response.status(400).json({
      message: "Données invalides.",
      errors: validation.error.issues,
    });
    return;
  }

  const activityData = validation.data;

  const dbResult = await query(
    `WITH created_activity AS (
      INSERT INTO activities (
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
        image_url,
        is_public
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    )
    SELECT created_activity.*, users.name AS owner_name, TRUE AS is_owned
    FROM created_activity
    JOIN users ON users.id = created_activity.owner_id`,
    [
      userId,
      activityData.title,
      activityData.description,
      activityData.minAge,
      activityData.maxAge,
      activityData.minChildren,
      activityData.maxChildren,
      activityData.durationMinutes,
      activityData.locationType,
      activityData.energyLevel,
      activityData.imageUrl,
      activityData.isPublic,
    ],
  );

  const createdActivity = dbResult.rows[0];

  if (!createdActivity) {
    throw new Error("L’activité créée n’a pas été retournée.");
  }

  response.status(201).json(createdActivity);
});

// PUT : Modifie une activité appartenant à l'utilisateur connecté
activitiesRouter.put("/:id", authenticate, async (request, response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    response.status(401).json({ message: "Authentification requise." });
    return;
  }

  const paramsValidation = activityIdParamsSchema.safeParse(request.params);

  if (!paramsValidation.success) {
    response.status(400).json({
      message: "Identifiant invalide.",
      errors: paramsValidation.error.issues,
    });
    return;
  }

  const bodyValidation = updateActivityBodySchema.safeParse(request.body);

  if (!bodyValidation.success) {
    response.status(400).json({
      message: "Données invalides.",
      errors: bodyValidation.error.issues,
    });
    return;
  }

  const { id } = paramsValidation.data;
  const activityData = bodyValidation.data;
  const dbResult = await query(
    `WITH updated_activity AS (
      UPDATE activities
      SET title = $1,
          description = $2,
          min_age = $3,
          max_age = $4,
          min_children = $5,
          max_children = $6,
          duration_minutes = $7,
          location_type = $8,
          energy_level = $9,
          image_url = $10,
          is_public = $11,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 AND owner_id = $13
      RETURNING *
    )
    SELECT updated_activity.*, users.name AS owner_name, TRUE AS is_owned
    FROM updated_activity
    JOIN users ON users.id = updated_activity.owner_id`,
    [
      activityData.title,
      activityData.description,
      activityData.minAge,
      activityData.maxAge,
      activityData.minChildren,
      activityData.maxChildren,
      activityData.durationMinutes,
      activityData.locationType,
      activityData.energyLevel,
      activityData.imageUrl,
      activityData.isPublic,
      id,
      userId,
    ],
  );

  const updatedActivity = dbResult.rows[0];

  if (!updatedActivity) {
    response.status(404).json({
      message: "Activité introuvable ou non autorisée.",
    });
    return;
  }

  response.json(updatedActivity);
});

// POST : Ajoute une activité publique à la valise sans créer de doublon
activitiesRouter.post("/:id/save", authenticate, async (request, response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    response.status(401).json({ message: "Authentification requise." });
    return;
  }

  const validation = activityIdParamsSchema.safeParse(request.params);

  if (!validation.success) {
    response.status(400).json({
      message: "Identifiant invalide.",
      errors: validation.error.issues,
    });
    return;
  }

  const { id } = validation.data;
  const activityResult = await query(
    `SELECT activities.*,
            users.name AS owner_name,
            (activities.owner_id = $2) AS is_owned
     FROM activities
     JOIN users ON users.id = activities.owner_id
     WHERE activities.id = $1
       AND (activities.is_public = TRUE OR activities.owner_id = $2)`,
    [id, userId],
  );
  const activity = activityResult.rows[0];

  if (!activity) {
    response.status(404).json({ message: "Activité introuvable." });
    return;
  }

  if (activity.owner_id === userId) {
    response.json({ activity, added: false });
    return;
  }

  const saveResult = await query(
    `INSERT INTO saved_activities (user_id, activity_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, activity_id) DO NOTHING
     RETURNING activity_id`,
    [userId, id],
  );

  const added = saveResult.rowCount === 1;
  response.status(added ? 201 : 200).json({ activity, added });
});
