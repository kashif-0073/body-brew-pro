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
  Meal,
  PlannedDay,
  Profile,
  WorkoutSession,
} from "./types";
import { generatePlan } from "./planner";

const KEY = "pulseforge-state-v1";

const EMPTY: AppState = {
  profile: null,
  plan: [],
  sessions: [],
  active: null,
  meals: [],
  body: [],
};

export const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  saveProfile: (p: Profile) => void;
  regeneratePlan: () => void;
  setPlan: (plan: PlannedDay[]) => void;
  startSession: (day: PlannedDay) => void;
  updateSet: (exIdx: number, setIdx: number, patch: { weightKg?: number; reps?: number; done?: boolean }) => void;
  addSet: (exIdx: number) => void;
  finishSession: () => void;
  discardSession: () => void;
  addMeal: (meal: Omit<Meal, "id" | "date"> & { date?: string }) => void;
  removeMeal: (id: string) => void;
  addBodyEntry: (entry: BodyEntry) => void;
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
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const saveProfile = useCallback((p: Profile) => {
    setState((s) => ({
      ...s,
      profile: p,
      plan: generatePlan(p),
      body:
        s.body.length && s.body[s.body.length - 1]?.date === today()
          ? s.body.map((b, i) =>
              i === s.body.length - 1 ? { date: today(), weightKg: p.weightKg, bodyFatPct: p.bodyFatPct } : b,
            )
          : [...s.body, { date: today(), weightKg: p.weightKg, bodyFatPct: p.bodyFatPct }],
    }));
  }, []);

  const regeneratePlan = useCallback(() => {
    setState((s) => (s.profile ? { ...s, plan: generatePlan(s.profile) } : s));
  }, []);

  const setPlan = useCallback((plan: PlannedDay[]) => setState((s) => ({ ...s, plan })), []);

  const startSession = useCallback((day: PlannedDay) => {
    const session: WorkoutSession = {
      id: uid(),
      date: today(),
      title: day.title,
      focus: day.focus,
      durationMin: day.durationMin,
      completed: false,
      exercises: day.exercises.map((e) => ({
        name: e.name,
        muscle: e.muscle,
        sets: Array.from({ length: e.sets }, () => ({
          weightKg: e.weightKg,
          reps: e.reps,
          done: false,
        })),
      })),
    };
    setState((s) => ({ ...s, active: session }));
  }, []);

  const updateSet = useCallback(
    (exIdx: number, setIdx: number, patch: { weightKg?: number; reps?: number; done?: boolean }) => {
      setState((s) => {
        if (!s.active) return s;
        const exercises = s.active.exercises.map((e, i) =>
          i !== exIdx
            ? e
            : { ...e, sets: e.sets.map((set, j) => (j === setIdx ? { ...set, ...patch } : set)) },
        );
        return { ...s, active: { ...s.active, exercises } };
      });
    },
    [],
  );

  const addSet = useCallback((exIdx: number) => {
    setState((s) => {
      if (!s.active) return s;
      const exercises = s.active.exercises.map((e, i) => {
        if (i !== exIdx) return e;
        const last = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [...e.sets, { weightKg: last?.weightKg ?? 0, reps: last?.reps ?? 10, done: false }],
        };
      });
      return { ...s, active: { ...s.active, exercises } };
    });
  }, []);

  const finishSession = useCallback(() => {
    setState((s) => {
      if (!s.active) return s;
      const done = { ...s.active, completed: true };
      const hasWork = done.exercises.some((e) => e.sets.some((x) => x.done));
      return {
        ...s,
        active: null,
        sessions: hasWork ? [done, ...s.sessions] : s.sessions,
      };
    });
  }, []);

  const discardSession = useCallback(() => setState((s) => ({ ...s, active: null })), []);

  const addMeal = useCallback((meal: Omit<Meal, "id" | "date"> & { date?: string }) => {
    setState((s) => ({
      ...s,
      meals: [{ ...meal, date: meal.date ?? today(), id: uid() }, ...s.meals],
    }));
  }, []);

  const removeMeal = useCallback(
    (id: string) => setState((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) })),
    [],
  );

  const addBodyEntry = useCallback((entry: BodyEntry) => {
    setState((s) => ({
      ...s,
      body: [...s.body.filter((b) => b.date !== entry.date), entry].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
      profile: s.profile
        ? { ...s.profile, weightKg: entry.weightKg, bodyFatPct: entry.bodyFatPct }
        : s.profile,
    }));
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
      finishSession,
      discardSession,
      addMeal,
      removeMeal,
      addBodyEntry,
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
      finishSession,
      discardSession,
      addMeal,
      removeMeal,
      addBodyEntry,
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
