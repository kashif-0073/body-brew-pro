import type { Equipment, Level } from "./types";

export interface ExerciseDef {
  name: string;
  muscle: string;
  group: "push" | "pull" | "legs" | "core" | "cardio";
  equipment: Equipment;
  /** Suggested working load as a multiple of bodyweight. 0 = bodyweight / time based. */
  bwRatio: number;
  minLevel: Level;
  compound: boolean;
}

const L: Record<Level, number> = { beginner: 0, intermediate: 1, professional: 2 };
export const levelRank = (l: Level) => L[l];

export const EXERCISES: ExerciseDef[] = [
  // Push
  { name: "Barbell Bench Press", muscle: "Chest", group: "push", equipment: "barbell", bwRatio: 0.8, minLevel: "intermediate", compound: true },
  { name: "Incline Dumbbell Press", muscle: "Chest", group: "push", equipment: "dumbbell", bwRatio: 0.28, minLevel: "beginner", compound: true },
  { name: "Overhead Press", muscle: "Shoulders", group: "push", equipment: "barbell", bwRatio: 0.5, minLevel: "intermediate", compound: true },
  { name: "Dumbbell Shoulder Press", muscle: "Shoulders", group: "push", equipment: "dumbbell", bwRatio: 0.22, minLevel: "beginner", compound: true },
  { name: "Machine Chest Press", muscle: "Chest", group: "push", equipment: "machine", bwRatio: 0.6, minLevel: "beginner", compound: true },
  { name: "Cable Triceps Pushdown", muscle: "Triceps", group: "push", equipment: "machine", bwRatio: 0.35, minLevel: "beginner", compound: false },
  { name: "Lateral Raise", muscle: "Shoulders", group: "push", equipment: "dumbbell", bwRatio: 0.1, minLevel: "beginner", compound: false },
  { name: "Push-Up", muscle: "Chest", group: "push", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: true },
  { name: "Dip", muscle: "Triceps", group: "push", equipment: "bodyweight", bwRatio: 0, minLevel: "intermediate", compound: true },
  { name: "Close-Grip Bench Press", muscle: "Triceps", group: "push", equipment: "barbell", bwRatio: 0.6, minLevel: "professional", compound: true },

  // Pull
  { name: "Barbell Row", muscle: "Back", group: "pull", equipment: "barbell", bwRatio: 0.7, minLevel: "intermediate", compound: true },
  { name: "Lat Pulldown", muscle: "Back", group: "pull", equipment: "machine", bwRatio: 0.6, minLevel: "beginner", compound: true },
  { name: "Seated Cable Row", muscle: "Back", group: "pull", equipment: "machine", bwRatio: 0.6, minLevel: "beginner", compound: true },
  { name: "Pull-Up", muscle: "Back", group: "pull", equipment: "bodyweight", bwRatio: 0, minLevel: "intermediate", compound: true },
  { name: "Inverted Row", muscle: "Back", group: "pull", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: true },
  { name: "Dumbbell Row", muscle: "Back", group: "pull", equipment: "dumbbell", bwRatio: 0.3, minLevel: "beginner", compound: true },
  { name: "Face Pull", muscle: "Rear delts", group: "pull", equipment: "machine", bwRatio: 0.25, minLevel: "beginner", compound: false },
  { name: "Barbell Curl", muscle: "Biceps", group: "pull", equipment: "barbell", bwRatio: 0.3, minLevel: "beginner", compound: false },
  { name: "Dumbbell Hammer Curl", muscle: "Biceps", group: "pull", equipment: "dumbbell", bwRatio: 0.15, minLevel: "beginner", compound: false },
  { name: "Weighted Pull-Up", muscle: "Back", group: "pull", equipment: "bodyweight", bwRatio: 0.2, minLevel: "professional", compound: true },

  // Legs
  { name: "Barbell Back Squat", muscle: "Quads", group: "legs", equipment: "barbell", bwRatio: 1.0, minLevel: "intermediate", compound: true },
  { name: "Goblet Squat", muscle: "Quads", group: "legs", equipment: "dumbbell", bwRatio: 0.3, minLevel: "beginner", compound: true },
  { name: "Romanian Deadlift", muscle: "Hamstrings", group: "legs", equipment: "barbell", bwRatio: 0.9, minLevel: "intermediate", compound: true },
  { name: "Conventional Deadlift", muscle: "Posterior chain", group: "legs", equipment: "barbell", bwRatio: 1.3, minLevel: "professional", compound: true },
  { name: "Leg Press", muscle: "Quads", group: "legs", equipment: "machine", bwRatio: 1.6, minLevel: "beginner", compound: true },
  { name: "Walking Lunge", muscle: "Glutes", group: "legs", equipment: "dumbbell", bwRatio: 0.2, minLevel: "beginner", compound: true },
  { name: "Leg Curl", muscle: "Hamstrings", group: "legs", equipment: "machine", bwRatio: 0.4, minLevel: "beginner", compound: false },
  { name: "Bulgarian Split Squat", muscle: "Quads", group: "legs", equipment: "dumbbell", bwRatio: 0.25, minLevel: "intermediate", compound: true },
  { name: "Standing Calf Raise", muscle: "Calves", group: "legs", equipment: "machine", bwRatio: 0.5, minLevel: "beginner", compound: false },
  { name: "Air Squat", muscle: "Quads", group: "legs", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: true },
  { name: "Glute Bridge", muscle: "Glutes", group: "legs", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: false },

  // Core
  { name: "Plank", muscle: "Core", group: "core", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: false },
  { name: "Hanging Leg Raise", muscle: "Core", group: "core", equipment: "bodyweight", bwRatio: 0, minLevel: "intermediate", compound: false },
  { name: "Cable Crunch", muscle: "Core", group: "core", equipment: "machine", bwRatio: 0.35, minLevel: "beginner", compound: false },
  { name: "Dead Bug", muscle: "Core", group: "core", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: false },

  // Cardio / conditioning
  { name: "Zone 2 Treadmill", muscle: "Cardio", group: "cardio", equipment: "cardio", bwRatio: 0, minLevel: "beginner", compound: false },
  { name: "Rowing Intervals", muscle: "Cardio", group: "cardio", equipment: "cardio", bwRatio: 0, minLevel: "intermediate", compound: false },
  { name: "Assault Bike Sprints", muscle: "Cardio", group: "cardio", equipment: "cardio", bwRatio: 0, minLevel: "professional", compound: false },
  { name: "Incline Walk", muscle: "Cardio", group: "cardio", equipment: "cardio", bwRatio: 0, minLevel: "beginner", compound: false },
  { name: "Burpees", muscle: "Cardio", group: "cardio", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: false },
  { name: "Jump Rope", muscle: "Cardio", group: "cardio", equipment: "bodyweight", bwRatio: 0, minLevel: "beginner", compound: false },
];
