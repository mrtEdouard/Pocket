import type {
  Activity,
  CreateActivityInput,
} from "../types/activity";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export interface ActivityApiResponse {
  id: number | string;
  is_owned?: boolean;
  owner_id: number | string;
  owner_name: string;
  title: string;
  description: string;
  min_age: number;
  max_age: number;
  min_children: number;
  max_children: number;
  duration_minutes: number;
  location_type: Activity["locationType"];
  energy_level: Activity["energyLevel"];
  image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiError {
  message?: string;
}

export function mapActivity(activity: ActivityApiResponse): Activity {
  const mappedActivity: Activity = {
    id: String(activity.id),
    isOwned: activity.is_owned ?? false,
    ownerId: String(activity.owner_id),
    ownerName: activity.owner_name,
    title: activity.title,
    description: activity.description,
    minAge: activity.min_age,
    maxAge: activity.max_age,
    minChildren: activity.min_children,
    maxChildren: activity.max_children,
    durationMinutes: activity.duration_minutes,
    locationType: activity.location_type,
    energyLevel: activity.energy_level,
    imageUrl: activity.image_url ?? null,
    isPublic: activity.is_public,
    createdAt: activity.created_at,
    updatedAt: activity.updated_at,
  };

  return mappedActivity;
}

async function getErrorMessage(response: Response): Promise<string> {
  const error = (await response.json().catch(() => null)) as ApiError | null;
  return error?.message ?? `Erreur HTTP ${response.status}.`;
}

async function getActivitiesFrom(
  path: string,
  signal?: AbortSignal,
): Promise<Activity[]> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));

  const activities = (await response.json()) as ActivityApiResponse[];
  return activities.map(mapActivity);
}

export function getPublicActivities(signal?: AbortSignal): Promise<Activity[]> {
  return getActivitiesFrom("/activities", signal);
}

export function getMyActivities(signal?: AbortSignal): Promise<Activity[]> {
  return getActivitiesFrom("/activities/mine", signal);
}

export async function createActivity(
  input: CreateActivityInput,
): Promise<Activity> {
  const response = await fetch(`${API_URL}/activities`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));

  const activity = (await response.json()) as ActivityApiResponse;
  return mapActivity(activity);
}

export async function updateActivity(
  id: string,
  input: CreateActivityInput,
): Promise<Activity> {
  const response = await fetch(`${API_URL}/activities/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));

  const activity = (await response.json()) as ActivityApiResponse;
  return mapActivity(activity);
}

export async function saveActivity(id: string): Promise<{
  activity: Activity;
  added: boolean;
}> {
  const response = await fetch(`${API_URL}/activities/${id}/save`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(await getErrorMessage(response));

  const data = (await response.json()) as {
    activity: ActivityApiResponse;
    added: boolean;
  };

  return {
    activity: mapActivity(data.activity),
    added: data.added,
  };
}
