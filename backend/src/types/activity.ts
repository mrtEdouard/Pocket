export interface Activity {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  minAge: number;
  maxAge: number;
  minChildren: number;
  maxChildren: number;
  durationMinutes: number;
  locationType: "indoor" | "outdoor" | "both";
  energyLevel: "low" | "medium" | "high";
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityInput {
  title: string;
  description: string;
  minAge: number;
  maxAge: number;
  minChildren: number;
  maxChildren: number;
  durationMinutes: number;
  locationType: "indoor" | "outdoor" | "both";
  energyLevel: "low" | "medium" | "high";
  isPublic: boolean;
}