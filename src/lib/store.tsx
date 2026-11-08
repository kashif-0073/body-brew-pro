import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  BodyEntry,
  FoodFavorite,
  Meal,
  PlannedDay,
  Profile,
  WorkoutSession,
} from "./types";
import { generatePlanFor as generatePlan } from "./planner";
import { lastPerformance, progressedLoad } from "./metrics";

const KEY = "pulseforge-state-v1";

const EMPTY: AppState = {
  profile: null,
  plan: [],
  sessions: [],
  active: null,
  meals: [],
  body: [],
  favorites: [],
  water: [],
};

export const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);

export interface SetPatch {
  weightKg?: number;
  reps?: number;
  done?: boolean;
  rpe?: number | undefined;
}

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  saveProfile: (p: Profile) => void;
  regeneratePlan: () => void;
  setPlan: (plan: PlannedDay[]) => void;
  startSession: (day: PlannedDay) => void;
  updateSet: (exIdx: number, setIdx: number, patch: SetPatch) => void;
  addSet: (exIdx: number) => void;
  removeSet: (exIdx: number, setIdx: number) => void;
  addExercise: (name: string, muscle: string, reps?: number, weightKg?: number) => void;
  removeExercise: (exIdx: number) => void;
  setExerciseNote: (exIdx: number, note: string) => void;
  setSessionNotes: (notes: string) => void;
  finishSession: () => WorkoutSession | null;
  discardSession: () => void;
  deleteSession: (id: string) => void;
  addMeal: (meal: Omit<Meal, "id" | "date"> & { date?: string }) => void;
  updateMeal: (id: string, patch: Partial<Omit<Meal, "id">>) => void;
  removeMeal: (id: string) => void;
  copyMeals: (fromDate: string, toDate: string) => number;
  addFavorite: (fav: Omit<FoodFavorite, "id">) => void;
  removeFavorite: (id: string) => void;
  addWater: (ml: number, date?: string) => void;
  addBodyEntry: (entry: BodyEntry) => void;
  importState: (raw: string) => void;
  exportState: () => string;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as AppState) });
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — keep the app usable in memory */
    }
  }, [state, hydrated]);

  const saveProfile = useCallback((p: Profile) => {
    setState((s) => ({
      ...s,
      profile: p,
      plan: generatePlan(p),
      body:
        s.body.some((b) => b.date === today())
          ? s.body.map((b) =>
              b.date === today() ? { date: today(), weightKg: p.weightKg, bodyFatPct: p.bodyFatPct } : b,
            )
          : [...s.body, { date: today(), weightKg: p.weightKg, bodyFatPct: p.bodyFatPct }],
    }));
  }, []);

  const regeneratePlan = useCallback(() => {
    setState((s) => (s.profile ? { ...s, plan: generatePlan(s.profile) } : s));
  }, []);

  const setPlan = useCallback((plan: PlannedDay[]) => setState((s) => ({ ...s, plan })), []);

  const startSession = useCallback((day: PlannedDay) => {
    setState((s) => {
      if (s.active) return s; // never silently drop an in-progress session
      const session: WorkoutSession = {
        id: uid(),
        date: today(),
        title: day.title,
        focus: day.focus,
        durationMin: day.durationMin,
        completed: false,
        startedAt: Date.now(),
        exercises: day.exercises.map((e) => {
          // Auto-progression: start from what was actually lifted last time.
          const last = lastPerformance(s.sessions, e.name);
          const load = progressedLoad({ weightKg: e.weightKg, reps: e.reps }, last);
          return {
            name: e.name,
            muscle: e.muscle,
            sets: Array.from({ length: e.sets }, () => ({
              weightKg: e.weightKg > 0 ? load.weightKg : 0,
              reps: e.reps,
              done: false,
            })),
          };
        }),
      };
      return { ...s, active: session };
    });
  }, []);

  const patchActive = useCallback(
    (fn: (session: WorkoutSession) => WorkoutSession) =>
      setState((s) => (s.active ? { ...s, active: fn(s.active) } : s)),
    [],
  );

  const updateSet = useCallback(
    (exIdx: number, setIdx: number, patch: SetPatch) =>
      patchActive((a) => ({
        ...a,
        exercises: a.exercises.map((e, i) =>
          i !== exIdx
            ? e
            : { ...e, sets: e.sets.map((set, j) => (j === setIdx ? { ...set, ...patch } : set)) },
        ),
      })),
    [patchActive],
  );

  const addSet = useCallback(
    (exIdx: number) =>
      patchActive((a) => ({
        ...a,
        exercises: a.exercises.map((e, i) => {
          if (i !== exIdx) return e;
          const last = e.sets[e.sets.length - 1];
          return {
            ...e,
            sets: [...e.sets, { weightKg: last?.weightKg ?? 0, reps: last?.reps ?? 10, done: false }],
          };
        }),
      })),
    [patchActive],
  );

  const removeSet = useCallback(
    (exIdx: number, setIdx: number) =>
      patchActive((a) => ({
        ...a,
        exercises: a.exercises.map((e, i) =>
          i !== exIdx ? e : { ...e, sets: e.sets.filter((_, j) => j !== setIdx) },
        ),
      })),
    [patchActive],
  );

  const addExercise = useCallback(
    (name: string, muscle: string, reps = 10, weightKg = 0) =>
      patchActive((a) => ({
        ...a,
        exercises: [
          ...a.exercises,
          { name, muscle, sets: Array.from({ length: 3 }, () => ({ weightKg, reps, done: false })) },
        ],
      })),
    [patchActive],
  );

  const removeExercise = useCallback(
    (exIdx: number) =>
      patchActive((a) => ({ ...a, exercises: a.exercises.filter((_, i) => i !== exIdx) })),
    [patchActive],
  );

  const setExerciseNote = useCallback(
    (exIdx: number, note: string) =>
      patchActive((a) => ({
        ...a,
        exercises: a.exercises.map((e, i) => (i === exIdx ? { ...e, note } : e)),
      })),
    [patchActive],
  );

  const setSessionNotes = useCallback(
    (notes: string) => patchActive((a) => ({ ...a, notes })),
    [patchActive],
  );

  const finishSession = useCallback((): WorkoutSession | null => {
    const current = state.active;
    if (!current) return null;
    const hasWork = current.exercises.some((e) => e.sets.some((x) => x.done));
    if (!hasWork) {
      setState((s) => ({ ...s, active: null }));
      return null;
    }
    const done: WorkoutSession = {
      ...current,
      completed: true,
      // Stamp the day it was finished, not the day it was opened.
      date: today(),
      elapsedMin: current.startedAt
        ? Math.max(1, Math.round((Date.now() - current.startedAt) / 60_000))
        : current.durationMin,
    };
    setState((s) => ({ ...s, active: null, sessions: [done, ...s.sessions] }));
    return done;
  }, [state.active]);

  const discardSession = useCallback(() => setState((s) => ({ ...s, active: null })), []);

  const deleteSession = useCallback(
    (id: string) => setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) })),
    [],
  );

  const addMeal = useCallback((meal: Omit<Meal, "id" | "date"> & { date?: string }) => {
    setState((s) => ({
      ...s,
      meals: [{ ...meal, date: meal.date ?? today(), id: uid() }, ...s.meals],
    }));
  }, []);

  const updateMeal = useCallback(
    (id: string, patch: Partial<Omit<Meal, "id">>) =>
      setState((s) => ({
        ...s,
        meals: s.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      })),
    [],
  );

  const removeMeal = useCallback(
    (id: string) => setState((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) })),
    [],
  );

  const copyMeals = useCallback((fromDate: string, toDate: string) => {
    let count = 0;
    setState((s) => {
      const src = s.meals.filter((m) => m.date === fromDate);
      count = src.length;
      if (!src.length) return s;
      return {
        ...s,
        meals: [...src.map((m) => ({ ...m, id: uid(), date: toDate })), ...s.meals],
      };
    });
    return count;
  }, []);

  const addFavorite = useCallback((fav: Omit<FoodFavorite, "id">) => {
    setState((s) =>
      s.favorites.some((f) => f.name.toLowerCase() === fav.name.toLowerCase())
        ? s
        : { ...s, favorites: [{ ...fav, id: uid() }, ...s.favorites].slice(0, 30) },
    );
  }, []);

  const removeFavorite = useCallback(
    (id: string) => setState((s) => ({ ...s, favorites: s.favorites.filter((f) => f.id !== id) })),
    [],
  );

  const addWater = useCallback((ml: number, date?: string) => {
    const d = date ?? today();
    setState((s) => {
      const existing = s.water.find((w) => w.date === d);
      const next = Math.max(0, (existing?.ml ?? 0) + ml);
      return {
        ...s,
        water: existing
          ? s.water.map((w) => (w.date === d ? { date: d, ml: next } : w))
          : [...s.water, { date: d, ml: next }],
      };
    });
  }, []);

  const addBodyEntry = useCallback((entry: BodyEntry) => {
    setState((s) => {
      const body = [...s.body.filter((b) => b.date !== entry.date), entry].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const latest = body[body.length - 1];
      return {
        ...s,
        body,
        // Only the newest measurement should move the profile's current stats.
        profile:
          s.profile && latest
            ? { ...s.profile, weightKg: latest.weightKg, bodyFatPct: latest.bodyFatPct }
            : s.profile,
      };
    });
  }, []);

  const exportState = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importState = useCallback((raw: string) => {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (typeof parsed !== "object" || parsed === null) throw new Error("Not a PulseForge backup");
    setState({ ...EMPTY, ...parsed, active: null });
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      hydrated,
      saveProfile,
      regeneratePlan,
      setPlan,
      startSession,
      updateSet,
      addSet,
      removeSet,
      addExercise,
      removeExercise,
      setExerciseNote,
      setSessionNotes,
      finishSession,
      discardSession,
      deleteSession,
      addMeal,
      updateMeal,
      removeMeal,
      copyMeals,
      addFavorite,
      removeFavorite,
      addWater,
      addBodyEntry,
      importState,
      exportState,
      reset,
    }),
    [
      state,
      hydrated,
      saveProfile,
      regeneratePlan,
      setPlan,
      startSession,
      updateSet,
      addSet,
      removeSet,
      addExercise,
      removeExercise,
      setExerciseNote,
      setSessionNotes,
      finishSession,
      discardSession,
      deleteSession,
      addMeal,
      updateMeal,
      removeMeal,
      copyMeals,
      addFavorite,
      removeFavorite,
      addWater,
      addBodyEntry,
      importState,
      exportState,
      reset,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
