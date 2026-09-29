import type { NextFunction, Request, Response } from "express";

import {
  ACCESS_TOKEN_COOKIE,
  verifyAccessToken,
} from "../services/token.js";

// Pour vérifier si un utilisateur est connecté, sinon on le tej
export async function authenticate(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const token = request.cookies?.[ACCESS_TOKEN_COOKIE];

  if (typeof token !== "string") {
    response.status(401).json({ message: "Authentification requise." });
    return;
  }

  try {
    const userId = await verifyAccessToken(token);
    request.auth = { userId };
    next();
  } catch {
    response.status(401).json({ message: "Session invalide ou expirée." });
  }
}
