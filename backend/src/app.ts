import cors from "cors";
import cookieParser from "cookie-parser";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { config } from "./config.js";
import { query } from "./database.js";


// ROUTEURS
import { postsRouter } from "./routes/posts.js";
import { activitiesRouter } from "./routes/activities.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { commentsRouter } from "./routes/comments.js";

export const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", async (_request, response) => {
  await query("SELECT 1");
  response.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/activities", activitiesRouter);
app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/comments", commentsRouter);


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
