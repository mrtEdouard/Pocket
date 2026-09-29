import { Router, type CookieOptions, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import type { QueryResultRow } from "pg";

import { config } from "../config.js";
import { query } from "../database.js";
import { authenticate } from "../middleware/authenticate.js";
import { loginBodySchema, registerBodySchema } from "../schemas/auth.js";
import { hashPassword, verifyPassword } from "../services/password.js";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  createAccessToken,
} from "../services/token.js";

export const authRouter = Router();

interface PublicUserRow extends QueryResultRow {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserWithPasswordRow extends PublicUserRow {
  passwordHash: string;
}

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Trop de tentatives. Réessayez dans 15 minutes." },
});

const dummyPasswordHash = hashPassword(
  "mot-de-passe-factice-utilise-uniquement-pour-le-timing",
);

function isPostgresError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
}

async function setAuthenticationCookie(
  response: Response,
  userId: string,
): Promise<void> {
  const token = await createAccessToken(userId);

  response.cookie(ACCESS_TOKEN_COOKIE, token, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

// POST : Inscrit un nouvel utilisateur
authRouter.post("/register", async (request, response) => {
  const validation = registerBodySchema.safeParse(request.body);

  if (!validation.success) {
    response.status(400).json({
      message: "Données d’inscription invalides.",
      errors: validation.error.issues,
    });
    return;
  }

  const { name, email, password } = validation.data;
  const passwordHash = await hashPassword(password);

  try {
    const dbResult = await query<PublicUserRow>(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING
         id::text AS id,
         name,
         email,
         created_at AS "createdAt",
         updated_at AS "updatedAt"`,
      [name, email, passwordHash],
    );

    const user = dbResult.rows[0];

    if (!user) {
      throw new Error("L’utilisateur créé n’a pas été retourné.");
    }

    await setAuthenticationCookie(response, user.id);
    response.status(201).json({ user });
  } catch (error) {
    if (isPostgresError(error) && error.code === "23505") {
      response.status(409).json({
        message: "Un compte utilise déjà cette adresse email.",
      });
      return;
    }

    throw error;
  }
});

// POST : Connecte un utilisateur avec son email et son mot de passe
authRouter.post("/login", loginLimiter, async (request, response) => {
  const validation = loginBodySchema.safeParse(request.body);

  if (!validation.success) {
    response.status(400).json({
      message: "Données de connexion invalides.",
      errors: validation.error.issues,
    });
    return;
  }

  const { email, password } = validation.data;
  const dbResult = await query<UserWithPasswordRow>(
    `SELECT
       id::text AS id,
       name,
       email,
       password AS "passwordHash",
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  const user = dbResult.rows[0];
  const passwordHash = user?.passwordHash ?? (await dummyPasswordHash);
  const passwordIsValid = await verifyPassword(passwordHash, password);

  if (!user || !passwordIsValid) {
    response.status(401).json({
      message: "Email ou mot de passe incorrect.",
    });
    return;
  }

  const { passwordHash: _passwordHash, ...publicUser } = user;

  await setAuthenticationCookie(response, user.id);
  response.json({ user: publicUser });
});

// POST : Déconnecte l’utilisateur en supprimant son cookie
authRouter.post("/logout", (_request, response) => {
  response.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
  response.status(204).send();
});

// GET : Récupère le profil de l’utilisateur connecté
authRouter.get("/me", authenticate, async (request, response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    response.status(401).json({ message: "Authentification requise." });
    return;
  }

  const dbResult = await query<PublicUserRow>(
    `SELECT
       id::text AS id,
       name,
       email,
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM users
     WHERE id = $1`,
    [userId],
  );

  const user = dbResult.rows[0];

  if (!user) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
    response.status(401).json({ message: "Utilisateur introuvable." });
    return;
  }

  response.json({ user });
});
