import type { WorkoutSession } from "./types";

export type RecoveryStatus = "fatigued" | "recovering" | "fresh" | "untrained";

export interface MuscleRecovery {
  muscle: string;
  /** 0–100 recovered */
  percent: number;
  status: RecoveryStatus;
  hoursSince: number | null;
  hoursLeft: number;
  weeklySets: number;
  exercises: string[];
}

/** Full recovery window: 48 h for light work, 72 h when 6+ hard sets hit the muscle in one session. */
export function recoveryWindow(setsInSession: number): number {
  return setsInSession >= 6 ? 72 : 48;
}

function sessionTime(s: WorkoutSession): number {
  return s.startedAt ?? new Date(`${s.date}T12:00:00`).getTime();
}

export function muscleRecovery(
  sessions: WorkoutSession[],
  muscles: string[],
  now: number = Date.now(),
): MuscleRecovery[] {
  const weekAgo = now - 7 * 86_400_000;
  return muscles.map((muscle) => {
    let last: { t: number; sets: number } | null = null;
    let weeklySets = 0;
    const exercises = new Set<string>();
    for (const s of sessions) {
      const t = sessionTime(s);
      let sets = 0;
      for (const e of s.exercises) {
        if (e.muscle !== muscle) continue;
        const done = e.sets.filter((x) => x.done).length;
        if (!done) continue;
        sets += done;
        if (t >= weekAgo) exercises.add(e.name);
      }
      if (!sets) continue;
      if (t >= weekAgo) weeklySets += sets;
      if (!last || t > last.t) last = { t, sets };
    }
    if (!last) {
      return { muscle, percent: 100, status: "untrained", hoursSince: null, hoursLeft: 0, weeklySets, exercises: [] };
    }
    const hoursSince = Math.max(0, (now - last.t) / 3_600_000);
    const window = recoveryWindow(last.sets);
    const percent = Math.min(100, Math.round((hoursSince / window) * 100));
    const status: RecoveryStatus = percent >= 100 ? "fresh" : percent < 50 ? "fatigued" : "recovering";
    return {
      muscle,
      percent,
      status,
      hoursSince: Math.round(hoursSince),
      hoursLeft: Math.max(0, Math.ceil(window - hoursSince)),
      weeklySets,
      exercises: [...exercises],
    };
  });
}
