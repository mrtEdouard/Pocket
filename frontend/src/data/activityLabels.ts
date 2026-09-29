import type { Activity } from "../types/activity";

export const locationLabels: Record<Activity["locationType"], string> = {
  indoor: "Intérieur",
  outdoor: "Extérieur",
  both: "Intérieur / extérieur",
};

export const energyLabels: Record<Activity["energyLevel"], string> = {
  low: "Calme",
  medium: "Modérée",
  high: "Dynamique",
};
