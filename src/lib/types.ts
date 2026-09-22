export type Level = "beginner" | "intermediate" | "professional";
export type Goal = "muscle" | "fatloss" | "cardio" | "strength";
export type Equipment = "bodyweight" | "dumbbell" | "barbell" | "machine" | "cardio";
export type Sex = "male" | "female";
export type Activity = "sedentary" | "light" | "moderate" | "high" | "athlete";

export interface Profile {
  name: string;
  level: Level;
  goal: Goal;
  daysPerWeek: number;
  equipment: Equipment[];
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct: number;
  restingHr: number;
  activity: Activity;
}

export interface PlannedExercise {
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  weightKg: number;
  restSec: number;
  note?: string;
}

export interface PlannedDay {
  id: string;
  title: string;
  focus: string;
  durationMin: number;
  exercises: PlannedExercise[];
  source: "built-in" | "ai";
}

export interface LoggedSet {
  weightKg: number;
  reps: number;
  done: boolean;
  /** Rate of perceived exertion, 6–10. */
  rpe?: number;
}

export interface LoggedExercise {
  name: string;
  muscle: string;
  sets: LoggedSet[];
  note?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  focus: string;
  durationMin: number;
  exercises: LoggedExercise[];
  completed: boolean;
  /** Epoch ms when the session was started, for real elapsed time. */
  startedAt?: number;
  elapsedMin?: number;
  notes?: string;
}

export interface Meal {
  id: string;
  date: string;
  name: string;
  slot: "breakfast" | "lunch" | "dinner" | "snack";
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface BodyEntry {
  date: string;
  weightKg: number;
  bodyFatPct: number;
}

/** A saved food the user can re-log in one tap. */
export interface FoodFavorite {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WaterEntry {
  date: string;
  ml: number;
}

export interface AppState {
  profile: Profile | null;
  plan: PlannedDay[];
  sessions: WorkoutSession[];
  active: WorkoutSession | null;
  meals: Meal[];
  body: BodyEntry[];
  favorites: FoodFavorite[];
  water: WaterEntry[];
}

export const GOAL_LABEL: Record<Goal, string> = {
  muscle: "Muscle building",
  fatloss: "Fat loss",
  cardio: "Cardiovascular health",
  strength: "Strength",
};

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  professional: "Professional",
};

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  bodyweight: "Bodyweight",
  dumbbell: "Dumbbells",
  barbell: "Barbell",
  machine: "Machines",
  cardio: "Cardio machines",
};
