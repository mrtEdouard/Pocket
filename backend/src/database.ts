import { Pool, type QueryResult, type QueryResultRow } from "pg";

import { config } from "./config.js";

export const pool = new Pool({ connectionString: config.databaseUrl });

pool.on("error", (error) => {
  console.error("Connexion PostgreSQL interrompue :", error);
});

export function query<Row extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<Row>> {
  return pool.query<Row>(text, values);
}
