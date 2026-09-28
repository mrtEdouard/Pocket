import type { Activity } from "../types/activity";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

interface ApiError {
  message?: string;
}

export async function getActivities(signal?: AbortSignal): Promise<Activity[]> {
  const response = await fetch(`${API_URL}/activities`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(error?.message ?? `Erreur HTTP ${response.status}.`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("La réponse de l’API n’est pas une liste d’activités.");
  }

  return data as Activity[];
}
