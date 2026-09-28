// backend/src/routes/activities.ts
import { Router } from "express";
import { query } from "../database.js";

export const activitiesRouter = Router();

activitiesRouter.get("/", async (_request, response) => {
  const result = await query("SELECT * FROM activities");
  response.json(result.rows);
});