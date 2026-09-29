import { mapActivity, type ActivityApiResponse } from "./activities";
import type { Activity } from "../types/activity";
import type { PublicUser } from "../types/user";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

interface ApiError {
  message?: string;
}

interface PublicProfileResponse {
  profile: PublicUser;
  activities: ActivityApiResponse[];
}

async function getErrorMessage(response: Response): Promise<string> {
  const error = (await response.json().catch(() => null)) as ApiError | null;
  return error?.message ?? `Erreur HTTP ${response.status}.`;
}

export async function getRecentUsers(
  signal?: AbortSignal,
): Promise<PublicUser[]> {
  const response = await fetch(`${API_URL}/users/recent`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));
  return (await response.json()) as PublicUser[];
}

export async function getPublicProfile(
  id: string,
  signal?: AbortSignal,
): Promise<{ profile: PublicUser; activities: Activity[] }> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));

  const data = (await response.json()) as PublicProfileResponse;
  return {
    profile: data.profile,
    activities: data.activities.map(mapActivity),
  };
}
