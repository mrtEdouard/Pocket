import { app } from "./app.js";
import { config } from "./config.js";
import { pool, query } from "./database.js";

try {
  await query("SELECT 1");

  const server = app.listen(config.port, () => {
    console.log(`API Pocket disponible sur http://localhost:${config.port}`);
  });

  async function shutdown(): Promise<void> {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (error) {
  console.error("Impossible de démarrer l’API :", error);
  await pool.end();
  process.exit(1);
}
