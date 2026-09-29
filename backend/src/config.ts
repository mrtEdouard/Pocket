import path from "node:path";
import { randomBytes } from "node:crypto";

import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

function readPort(value: string | undefined): number {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("API_PORT doit être un port valide.");
  }

  return port;
}

const nodeEnv = process.env.NODE_ENV?.trim() || "development";

function readJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (nodeEnv === "production") {
    throw new Error("JWT_SECRET doit contenir au moins 32 caractères.");
  }

  console.warn(
    "JWT_SECRET absent : une clé temporaire est utilisée en développement.",
  );
  return randomBytes(32).toString("hex");
}

export const config = {
  port: readPort(process.env.API_PORT),
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://pocket:pocket_dev_password@localhost:5432/pocket",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  jwtSecret: readJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "1h",
  nodeEnv,
};
