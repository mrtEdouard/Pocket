import { SignJWT, jwtVerify } from "jose";

import { config } from "../config.js";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 1_000;

const jwtSecret = new TextEncoder().encode(config.jwtSecret);

export async function createAccessToken(userId: string): Promise<string> {
  return new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(config.jwtExpiresIn)
    .sign(jwtSecret);
}

export async function verifyAccessToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, jwtSecret, {
    algorithms: ["HS256"],
  });

  if (!payload.sub) {
    throw new Error("Le token ne contient pas d’identifiant utilisateur.");
  }

  return payload.sub;
}
