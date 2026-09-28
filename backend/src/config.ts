import path from "node:path";

import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

function readPort(value: string | undefined): number {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("API_PORT doit être un port valide.");
  }

  return port;
}

export const config = {
  port: readPort(process.env.API_PORT),
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://pocket:pocket_dev_password@localhost:5432/pocket",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
