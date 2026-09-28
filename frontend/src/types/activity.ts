export interface Activity {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  min_age: number;
  max_age: number;
  min_children: number;
  max_children: number;
  duration_minutes: number;
  location_type: "indoor" | "outdoor" | "both";
  energy_level: "low" | "medium" | "high";
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
