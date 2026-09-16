import { EXERCISES, levelRank, type ExerciseDef } from "./exercises";
import type { Goal, Level, PlannedDay, PlannedExercise, Profile } from "./types";

interface Scheme {
  sets: number;
  reps: number;
  restSec: number;
  intensity: number; // fraction of the bodyweight-ratio reference load
}

function scheme(goal: Goal, level: Level, compound: boolean): Scheme {
  const lvl = levelRank(level);
  if (goal === "strength")
    return { sets: compound ? 5 : 3, reps: compound ? 5 : 8, restSec: compound ? 180 : 90, intensity: 0.85 + lvl * 0.05 };
  if (goal === "muscle")
    return { sets: compound ? 4 : 3, reps: compound ? 8 : 12, restSec: compound ? 120 : 75, intensity: 0.7 + lvl * 0.05 };
  if (goal === "fatloss")
    return { sets: 3, reps: compound ? 12 : 15, restSec: 60, intensity: 0.6 + lvl * 0.05 };
  return { sets: 3, reps: 15, restSec: 45, intensity: 0.5 + lvl * 0.05 };
}

function roundLoad(kg: number): number {
  if (kg <= 0) return 0;
  return Math.max(2.5, Math.round(kg / 2.5) * 2.5);
}

function toPlanned(def: ExerciseDef, p: Profile): PlannedExercise {
  const s = scheme(p.goal, p.level, def.compound);
  const weight = def.bwRatio === 0 ? 0 : roundLoad(p.weightKg * def.bwRatio * s.intensity);
  return {
    name: def.name,
    muscle: def.muscle,
    sets: s.sets,
    reps: s.reps,
    weightKg: weight,
    restSec: s.restSec,
    ...(def.group === "cardio"
      ? { note: p.goal === "cardio" ? "Hold 70–80% max HR" : "Finisher — steady effort" }
      : {}),
  };
}

const SPLITS: Record<number, { title: string; focus: string; groups: ExerciseDef["group"][] }[]> = {
  2: [
    { title: "Full Body A", focus: "Full body", groups: ["legs", "push", "pull", "core"] },
    { title: "Full Body B", focus: "Full body", groups: ["pull", "legs", "push", "cardio"] },
  ],
  3: [
    { title: "Push Day", focus: "Chest · Shoulders · Triceps", groups: ["push", "push", "core"] },
    { title: "Pull Day", focus: "Back · Biceps", groups: ["pull", "pull", "core"] },
    { title: "Leg Day", focus: "Quads · Hamstrings · Glutes", groups: ["legs", "legs", "cardio"] },
  ],
  4: [
    { title: "Upper A", focus: "Chest · Back", groups: ["push", "pull", "push", "pull"] },
    { title: "Lower A", focus: "Quads · Glutes", groups: ["legs", "legs", "core"] },
    { title: "Upper B", focus: "Shoulders · Arms", groups: ["push", "pull", "push", "pull"] },
    { title: "Conditioning", focus: "Cardio · Core", groups: ["cardio", "core", "legs"] },
  ],
  5: [
    { title: "Push Day", focus: "Chest · Shoulders · Triceps", groups: ["push", "push", "push"] },
    { title: "Pull Day", focus: "Back · Biceps", groups: ["pull", "pull", "pull"] },
    { title: "Leg Day", focus: "Quads · Hamstrings", groups: ["legs", "legs", "legs"] },
    { title: "Upper Volume", focus: "Chest · Back", groups: ["push", "pull", "core"] },
    { title: "Engine Day", focus: "Cardio · Core", groups: ["cardio", "cardio", "core"] },
  ],
  6: [
    { title: "Push A", focus: "Chest · Triceps", groups: ["push", "push", "push"] },
    { title: "Pull A", focus: "Back · Biceps", groups: ["pull", "pull", "pull"] },
    { title: "Legs A", focus: "Quads", groups: ["legs", "legs", "core"] },
    { title: "Push B", focus: "Shoulders", groups: ["push", "push", "core"] },
    { title: "Pull B", focus: "Back width", groups: ["pull", "pull", "core"] },
    { title: "Legs B + Engine", focus: "Hamstrings · Cardio", groups: ["legs", "legs", "cardio"] },
  ],
};

export function generatePlan(p: Profile): PlannedDay[] {
  const days = Math.min(6, Math.max(2, p.daysPerWeek));
  const split = SPLITS[days] ?? SPLITS[3]!;
  const pool = EXERCISES.filter(
    (e) => p.equipment.includes(e.equipment) && levelRank(e.minLevel) <= levelRank(p.level),
  );

  const used = new Set<string>();
  const pick = (group: ExerciseDef["group"], preferCompound: boolean): ExerciseDef | null => {
    const candidates = pool.filter((e) => e.group === group && !used.has(e.name));
    if (!candidates.length) return null;
    candidates.sort((a, b) => {
      if (a.compound !== b.compound) return preferCompound ? (a.compound ? -1 : 1) : a.compound ? 1 : -1;
      return levelRank(b.minLevel) - levelRank(a.minLevel);
    });
    const chosen = candidates[0]!;
    used.add(chosen.name);
    return chosen;
  };

  const perDay = p.level === "beginner" ? 4 : p.level === "intermediate" ? 5 : 6;

  return split.map((day, i) => {
    const exercises: PlannedExercise[] = [];
    let slot = 0;
    while (exercises.length < perDay) {
      const group = day.groups[slot % day.groups.length]!;
      const def = pick(group, exercises.length < 2);
      if (def) exercises.push(toPlanned(def, p));
      slot++;
      if (slot > day.groups.length * 4) break;
    }
    if (p.goal === "cardio" || p.goal === "fatloss") {
      const cardio = pool.find((e) => e.group === "cardio" && !exercises.some((x) => x.name === e.name));
      if (cardio) exercises.push(toPlanned(cardio, p));
    }
    const duration = exercises.reduce((t, e) => t + e.sets * (e.restSec + 45), 0) / 60;
    return {
      id: `day-${i + 1}`,
      title: day.title,
      focus: day.focus,
      durationMin: Math.round(duration / 5) * 5,
      exercises,
      source: "built-in" as const,
    };
  });
}
