import type { Activity, Goal, Profile, WorkoutSession } from "./types";

/** Epley one-rep-max estimate. */
export function estimate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

/** Mifflin-St Jeor basal metabolic rate (kcal/day). */
export function bmr(p: Profile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.sex === "male" ? base + 5 : base - 161);
}

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  athlete: 1.9,
};

export function tdee(p: Profile): number {
  return Math.round(bmr(p) * ACTIVITY_FACTOR[p.activity]);
}

export interface MacroTarget {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Goal-adjusted calorie and macro targets (protein g/kg lean-biased). */
export function macroTargets(p: Profile): MacroTarget {
  const maintenance = tdee(p);
  const kcal = Math.round(
    maintenance *
      (p.goal === "fatloss" ? 0.8 : p.goal === "muscle" ? 1.1 : p.goal === "strength" ? 1.05 : 1),
  );
  const proteinPerKg = p.goal === "fatloss" ? 2.2 : p.goal === "muscle" ? 2.0 : 1.7;
  const protein = Math.round(p.weightKg * proteinPerKg);
  const fat = Math.round((kcal * (p.goal === "fatloss" ? 0.28 : 0.25)) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carbs, fat };
}

/** Lean mass and Fat-Free Mass Index. */
export function leanMass(p: Profile): number {
  return +(p.weightKg * (1 - p.bodyFatPct / 100)).toFixed(1);
}

export function ffmi(p: Profile): number {
  const m = p.heightCm / 100;
  const raw = leanMass(p) / (m * m);
  return +(raw + 6.1 * (1.8 - m)).toFixed(1);
}

/** Uth-Sørensen-Overgaard-Pedersen VO2max estimate from HR reserve. */
export function vo2max(p: Profile): number {
  const maxHr = 208 - 0.7 * p.age;
  const resting = Math.max(35, p.restingHr);
  return +(15.3 * (maxHr / resting)).toFixed(1);
}

export function sessionVolume(s: WorkoutSession): number {
  return s.exercises.reduce(
    (t, e) =>
      t + e.sets.reduce((st, set) => st + (set.done ? set.weightKg * set.reps : 0), 0),
    0,
  );
}

export function sessionBest1RM(s: WorkoutSession): number {
  let best = 0;
  for (const e of s.exercises)
    for (const set of e.sets)
      if (set.done) best = Math.max(best, estimate1RM(set.weightKg, set.reps));
  return Math.round(best);
}

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

export function volumeInWindow(sessions: WorkoutSession[], days: number): number {
  return sessions
    .filter((s) => daysAgo(s.date) < days)
    .reduce((t, s) => t + sessionVolume(s), 0);
}

/**
 * Acute:Chronic Workload Ratio — 7-day load vs 28-day average weekly load.
 * 0.8–1.3 is the recognised "sweet spot" for progressing without spiking injury risk.
 */
export function acwr(sessions: WorkoutSession[]): number {
  const acute = volumeInWindow(sessions, 7);
  const chronic = volumeInWindow(sessions, 28) / 4;
  if (chronic <= 0) return 0;
  return +(acute / chronic).toFixed(2);
}

export function acwrVerdict(v: number): { label: string; tone: "good" | "warn" | "low" } {
  if (v === 0) return { label: "Not enough data", tone: "low" };
  if (v < 0.8) return { label: "Detraining risk", tone: "low" };
  if (v <= 1.3) return { label: "Optimal load", tone: "good" };
  return { label: "Spike — deload soon", tone: "warn" };
}

/** Weekly hard-set count per muscle group (10–20 is the hypertrophy window). */
export function weeklySetsByMuscle(sessions: WorkoutSession[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of sessions.filter((x) => daysAgo(x.date) < 7))
    for (const e of s.exercises) {
      const done = e.sets.filter((x) => x.done).length;
      if (done) out[e.muscle] = (out[e.muscle] ?? 0) + done;
    }
  return out;
}

export function streak(sessions: WorkoutSession[]): number {
  const dates = new Set(sessions.map((s) => s.date));
  let n = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    if (dates.has(d)) n++;
    else if (i > 0) break;
  }
  return n;
}

export const GOAL_METRIC_FOCUS: Record<Goal, string> = {
  muscle: "Weekly hard sets & tonnage",
  fatloss: "Calorie deficit & lean mass retention",
  cardio: "VO₂max & zone-2 minutes",
  strength: "Estimated 1RM & intensity",
};
