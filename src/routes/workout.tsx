import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, Loader2, Sparkles, Timer } from "lucide-react";
import { Button, Eyebrow, Panel, StatTile, Tile } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { estimate1RM, sessionVolume } from "@/lib/metrics";
import { generateAiPlan } from "@/lib/ai.functions";
import { GOAL_LABEL, LEVEL_LABEL } from "@/lib/types";

export const Route = createFileRoute("/workout")({
  head: () => ({
    meta: [
      { title: "Workout Logger — PulseForge" },
      {
        name: "description",
        content: "Log every set, weight and rep with a built-in rest timer and live tonnage.",
      },
      { property: "og:title", content: "Workout Logger — PulseForge" },
      {
        property: "og:description",
        content: "Log every set, weight and rep with a built-in rest timer and live tonnage.",
      },
    ],
  }),
  component: WorkoutPage,
});

function WorkoutPage() {
  const { state, hydrated, startSession, updateSet, addSet, finishSession, discardSession, setPlan } =
    useStore();
  const [rest, setRest] = useState(0);
  const [aiRequest, setAiRequest] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const aiPlan = useServerFn(generateAiPlan);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (rest <= 0) return;
    timerRef.current = setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rest > 0]);

  if (!hydrated) return <Panel className="h-64 animate-pulse" />;

  const { profile, plan, active } = state;

  if (!profile) {
    return (
      <Panel className="text-center py-12">
        <h1 className="font-display font-bold text-2xl">Set up your profile first</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your plan is built from your level, goal and equipment.
        </p>
      </Panel>
    );
  }

  const runAi = async () => {
    setLoadingAi(true);
    try {
      const days = await aiPlan({
        data: {
          level: profile.level,
          goal: profile.goal,
          daysPerWeek: profile.daysPerWeek,
          equipment: profile.equipment,
          weightKg: profile.weightKg,
          age: profile.age,
          request: aiRequest,
        },
      });
      if (!days.length) throw new Error("Empty plan");
      setPlan(days);
      toast.success("AI coach built a new weekly plan.");
      setAiRequest("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not build the AI plan.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (active) {
    const volume = sessionVolume(active);
    const best = Math.max(
      0,
      ...active.exercises.flatMap((e) =>
        e.sets.filter((s) => s.done).map((s) => estimate1RM(s.weightKg, s.reps)),
      ),
    );
    return (
      <div className="space-y-5">
        <Panel className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-violet/20 blur-3xl" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow className="text-violet">Live session · {active.focus}</Eyebrow>
              <h1 className="font-display font-bold text-4xl tracking-tight">{active.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass-tile rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <Timer className="size-4 text-cyan" />
                <span className="font-display font-bold text-xl tabular-nums">
                  {String(Math.floor(rest / 60)).padStart(2, "0")}:
                  {String(rest % 60).padStart(2, "0")}
                </span>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  finishSession();
                  setRest(0);
                  toast.success("Session saved to your history.");
                }}
              >
                Finish session
              </Button>
              <Button variant="danger" onClick={discardSession}>
                Discard
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
            <StatTile label="Tonnage" value={Math.round(volume).toLocaleString()} unit="kg" />
            <StatTile label="Best est. 1RM" value={Math.round(best)} unit="kg" tone="cyan" />
            <StatTile
              label="Sets done"
              value={active.exercises.reduce((t, e) => t + e.sets.filter((s) => s.done).length, 0)}
              unit={`/ ${active.exercises.reduce((t, e) => t + e.sets.length, 0)}`}
            />
            <StatTile label="Target" value={LEVEL_LABEL[profile.level]} delta={GOAL_LABEL[profile.goal]} tone="muted" />
          </div>
        </Panel>

        {active.exercises.map((ex, exIdx) => (
          <Panel key={ex.name}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] text-muted-foreground">{ex.muscle}</p>
                <h2 className="font-display font-semibold text-xl">{ex.name}</h2>
              </div>
              <Button size="sm" onClick={() => addSet(exIdx)}>
                Add set
              </Button>
            </div>
            <div className="space-y-2">
              {ex.sets.map((s, setIdx) => (
                <div
                  key={setIdx}
                  className={`grid grid-cols-12 items-center gap-2 rounded-xl px-3 py-2.5 ${
                    s.done ? "bg-cyan/[0.08] border border-cyan/30" : "glass-tile"
                  }`}
                >
                  <span className="col-span-2 text-xs text-muted-foreground">SET {setIdx + 1}</span>
                  <label className="col-span-4 sm:col-span-3 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={s.weightKg}
                      onChange={(e) =>
                        updateSet(exIdx, setIdx, { weightKg: Number(e.target.value) })
                      }
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                    />
                    <span className="text-xs text-muted-foreground">kg</span>
                  </label>
                  <label className="col-span-4 sm:col-span-3 flex items-center gap-1">
                    <input
                      type="number"
                      value={s.reps}
                      onChange={(e) => updateSet(exIdx, setIdx, { reps: Number(e.target.value) })}
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                    />
                    <span className="text-xs text-muted-foreground">reps</span>
                  </label>
                  <span className="hidden sm:block col-span-2 text-xs text-muted-foreground">
                    1RM {Math.round(estimate1RM(s.weightKg, s.reps))} kg
                  </span>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => {
                        updateSet(exIdx, setIdx, { done: !s.done });
                        if (!s.done) setRest(90);
                      }}
                      aria-label={s.done ? "Mark set not done" : "Mark set done"}
                      className={`grid size-8 place-items-center rounded-lg transition-all ${
                        s.done ? "gradient-brand text-ink" : "bg-softer text-muted-foreground"
                      }`}
                    >
                      <Check className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow>Weekly plan</Eyebrow>
            <h1 className="font-display font-bold text-3xl tracking-tight">
              {plan.length} training days
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {LEVEL_LABEL[profile.level]} · {GOAL_LABEL[profile.goal]} ·{" "}
              {plan[0]?.source === "ai" ? "AI coach plan" : "Built-in programme"}
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {plan.map((day) => (
          <Panel key={day.id}>
            <p className="text-[11px] text-muted-foreground">{day.focus}</p>
            <h2 className="font-display font-bold text-2xl mb-3">{day.title}</h2>
            <div className="space-y-1.5 mb-4">
              {day.exercises.map((ex) => (
                <div key={ex.name} className="flex items-center justify-between text-sm gap-2">
                  <span className="truncate">{ex.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {ex.sets} × {ex.reps}
                    {ex.weightKg > 0 ? ` @ ${ex.weightKg}kg` : ""}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{day.durationMin} min</span>
              <Button variant="primary" size="sm" onClick={() => startSession(day)}>
                Start
              </Button>
            </div>
          </Panel>
        ))}
      </div>

      <Panel>
        <Eyebrow className="text-violet">AI coach</Eyebrow>
        <h2 className="font-display font-bold text-2xl mb-2">Rebuild the week around a request</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Example: “sore lower back, swap deadlifts”, or “add two conditioning finishers”.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={aiRequest}
            onChange={(e) => setAiRequest(e.target.value)}
            placeholder="What should the coach change?"
            className="flex-1 glass-tile rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan/50"
          />
          <Button variant="primary" onClick={() => void runAi()} disabled={loadingAi}>
            {loadingAi ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loadingAi ? "Coaching…" : "Generate AI plan"}
          </Button>
        </div>
      </Panel>

      <Tile className="text-xs text-muted-foreground">
        Loads are starting suggestions based on your bodyweight and level — adjust them in the logger
        as you go, and the app tracks what you actually lifted.
      </Tile>
    </div>
  );
}
