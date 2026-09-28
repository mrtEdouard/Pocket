import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { config } from "./config.js";
import { query } from "./database.js";


import { activitiesRouter } from "./routes/activities.js";


export const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", async (_request, response) => {
  await query("SELECT 1");
  response.json({ status: "ok" });
});


app.use("/activities", activitiesRouter);




app.use((_request, response) => {
  response.status(404).json({ message: "Route introuvable." });
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    if (error instanceof SyntaxError && "body" in error) {
      response.status(400).json({ message: "Le JSON envoyé est invalide." });
      return;
    }

    console.error(error);
    response.status(500).json({ message: "Erreur interne du serveur." });
  },
);



