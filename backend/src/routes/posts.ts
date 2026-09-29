import { Router } from "express";
import type { QueryResultRow } from "pg";

import { query } from "../database.js";
import { authenticate } from "../middleware/authenticate.js";
import { createPostBodySchema } from "../schemas/post.js";

export const postsRouter = Router();

interface PostRow extends QueryResultRow {
  id: string;
  authorId: string;
  activityId: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// POST : Crée une publication pour l'utilisateur connecté
postsRouter.post("/", authenticate, async (request, response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    response.status(401).json({
      message: "Authentification requise.",
    });
    return;
  }

  const validation = createPostBodySchema.safeParse(request.body);

  if (!validation.success) {
    response.status(400).json({
      message: "Données de publication invalides.",
      errors: validation.error.issues,
    });
    return;
  }

  const { activityId, content, imageUrl } = validation.data;

  // Vérifie que l'activité existe et appartient bien à l'utilisateur connecté.
  const activityResult = await query<{ id: string }>(
    `SELECT id::text AS id
     FROM activities
     WHERE id = $1
       AND owner_id = $2`,
    [activityId, userId],
  );

  const activity = activityResult.rows[0];

  if (!activity) {
    response.status(404).json({
      message: "Activité introuvable ou non autorisée.",
    });
    return;
  }

  const postResult = await query<PostRow>(
    `INSERT INTO posts (
      author_id,
      activity_id,
      content,
      image_url
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id::text AS id,
      author_id::text AS "authorId",
      activity_id::text AS "activityId",
      content,
      image_url AS "imageUrl",
      created_at AS "createdAt",
      updated_at AS "updatedAt"`,
    [userId, activityId, content, imageUrl ?? null],
  );

  const createdPost = postResult.rows[0];

  if (!createdPost) {
    throw new Error("La publication créée n’a pas été retournée.");
  }

  response.status(201).json(createdPost);
});