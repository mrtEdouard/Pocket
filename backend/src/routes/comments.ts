import { Router } from "express";

import { query } from "../database.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  commentTargetParamsSchema,
  createCommentBodySchema,
} from "../schemas/comment.js";

export const commentsRouter = Router();

// GET : Liste les commentaires d'une activité ou d'une annonce
commentsRouter.get("/:targetType/:targetId", async (request, response) => {
  const validation = commentTargetParamsSchema.safeParse(request.params);

  if (!validation.success) {
    response.status(400).json({
      message: "Cible de commentaires invalide.",
      errors: validation.error.issues,
    });
    return;
  }

  const { targetType, targetId } = validation.data;

  if (targetType === "activity") {
    const activityResult = await query(
      `SELECT id FROM activities WHERE id = $1 AND is_public = TRUE`,
      [targetId],
    );

    if (!activityResult.rows[0]) {
      response.status(404).json({ message: "Activité introuvable." });
      return;
    }
  }

  const dbResult = await query(
    `SELECT comments.id::text AS id,
            comments.author_id::text AS "authorId",
            users.name AS "authorName",
            comments.content,
            comments.created_at AS "createdAt"
     FROM comments
     JOIN users ON users.id = comments.author_id
     WHERE comments.target_type = $1
       AND comments.target_id = $2
     ORDER BY comments.created_at ASC`,
    [targetType, targetId],
  );

  response.json(dbResult.rows);
});

// POST : Ajoute un commentaire avec l'identité de l'utilisateur connecté
commentsRouter.post(
  "/:targetType/:targetId",
  authenticate,
  async (request, response) => {
    const userId = request.auth?.userId;

    if (!userId) {
      response.status(401).json({ message: "Authentification requise." });
      return;
    }

    const paramsValidation = commentTargetParamsSchema.safeParse(request.params);
    const bodyValidation = createCommentBodySchema.safeParse(request.body);

    if (!paramsValidation.success || !bodyValidation.success) {
      response.status(400).json({ message: "Commentaire invalide." });
      return;
    }

    const { targetType, targetId } = paramsValidation.data;

    if (targetType === "activity") {
      const activityResult = await query(
        `SELECT id
         FROM activities
         WHERE id = $1
           AND (is_public = TRUE OR owner_id = $2)`,
        [targetId, userId],
      );

      if (!activityResult.rows[0]) {
        response.status(404).json({ message: "Activité introuvable." });
        return;
      }
    }

    const dbResult = await query(
      `WITH created_comment AS (
        INSERT INTO comments (author_id, target_type, target_id, content)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      )
      SELECT created_comment.id::text AS id,
             created_comment.author_id::text AS "authorId",
             users.name AS "authorName",
             created_comment.content,
             created_comment.created_at AS "createdAt"
      FROM created_comment
      JOIN users ON users.id = created_comment.author_id`,
      [userId, targetType, targetId, bodyValidation.data.content],
    );
    const comment = dbResult.rows[0];

    if (!comment) throw new Error("Le commentaire créé n’a pas été retourné.");
    response.status(201).json(comment);
  },
);
