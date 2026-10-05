import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, CircleHelp, Loader2, Plus, Sparkles, Timer, Trash2, Trophy, X } from "lucide-react";
import { ExerciseDetailsDialog } from "@/components/ExerciseDetailsDialog";
import { Button, Eyebrow, Panel, StatTile, Tile } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import {
  estimate1RM,
  lastPerformance,
  personalBests,
  sessionVolume,
} from "@/lib/metrics";
import { EXERCISES, type ExerciseDef } from "@/lib/exercises";
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

const fmt = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

function beep() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
    setTimeout(() => void ctx.close(), 400);
  } catch {
    /* audio not available */
  }
}

function WorkoutPage() {
  const {
    state,
    hydrated,
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
    setPlan,
  } = useStore();
  const [rest, setRest] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [aiRequest, setAiRequest] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [picker, setPicker] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDef | null>(null);
  const aiPlan = useServerFn(generateAiPlan);
  const startedAt = state.active?.startedAt;

  // Rest countdown.
  useEffect(() => {
    if (!restRunning) return;
    const id = setInterval(() => {
      setRest((r) => {
        if (r <= 1) {
          setRestRunning(false);
          beep();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [restRunning]);

  // Real elapsed session clock.
  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const prevBests = useRef<Record<string, number>>({});
  const bests = useMemo(() => personalBests(state.sessions), [state.sessions]);
  useEffect(() => {
    prevBests.current = Object.fromEntries(bests.map((b) => [b.name, b.e1rm]));
  }, [bests]);

  if (!hydrated) return <Panel className="h-64 animate-pulse" />;

  const { profile, plan, active, sessions } = state;

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
    const doneSets = active.exercises.reduce((t, e) => t + e.sets.filter((s) => s.done).length, 0);
    const allSets = active.exercises.reduce((t, e) => t + e.sets.length, 0);
    const best = Math.max(
      0,
      ...active.exercises.flatMap((e) =>
        e.sets.filter((s) => s.done).map((s) => estimate1RM(s.weightKg, s.reps)),
      ),
    );

    const onFinish = () => {
      const beforeBests = { ...prevBests.current };
      const saved = finishSession();
      setRest(0);
      setRestRunning(false);
      if (!saved) {
        toast.message("Nothing logged — session discarded.");
        return;
      }
      const newPrs: string[] = [];
      for (const e of saved.exercises) {
        const top = Math.max(
          0,
          ...e.sets.filter((s) => s.done).map((s) => estimate1RM(s.weightKg, s.reps)),
        );
        if (top > 0 && top > (beforeBests[e.name] ?? 0)) newPrs.push(e.name);
      }
      toast.success(
        `Session saved · ${doneSets} sets · ${Math.round(volume).toLocaleString()} kg${
          saved.elapsedMin ? ` · ${saved.elapsedMin} min` : ""
        }`,
      );
      if (newPrs.length)
        toast.success(`New personal best: ${newPrs.slice(0, 3).join(", ")}`, { duration: 6000 });
    };

    return (
      <div className="space-y-5">
        <Panel className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-violet/20 blur-3xl" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow className="text-violet">Live session · {active.focus}</Eyebrow>
              <h1 className="font-display font-bold text-4xl tracking-tight">{active.title}</h1>
              <p className="text-xs text-muted-foreground mt-1">Elapsed {fmt(elapsed)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="glass-tile rounded-2xl px-3 py-2 flex items-center gap-2">
                <Timer className={`size-4 ${restRunning ? "text-cyan animate-pulse" : "text-muted-foreground"}`} />
                <span className="font-display font-bold text-xl tabular-nums">{fmt(rest)}</span>
                <button
                  className="text-[11px] text-muted-foreground hover:text-foreground px-1"
                  onClick={() => {
                    setRest((r) => r + 30);
                    setRestRunning(true);
                  }}
                >
                  +30s
                </button>
                <button
                  className="text-[11px] text-muted-foreground hover:text-foreground px-1"
                  onClick={() => {
                    setRest(0);
                    setRestRunning(false);
                  }}
                >
                  skip
                </button>
              </div>
              <Button variant="primary" onClick={onFinish}>
                Finish session
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (doneSets > 0 && !confirm("Discard this session? Logged sets will be lost.")) return;
                  discardSession();
                  setRest(0);
                  setRestRunning(false);
                }}
              >
                Discard
              </Button>
            </div>
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-softer overflow-hidden">
            <div
              className="h-full gradient-brand rounded-full transition-all"
              style={{ width: `${allSets ? (doneSets / allSets) * 100 : 0}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <StatTile label="Tonnage" value={Math.round(volume).toLocaleString()} unit="kg" />
            <StatTile label="Best est. 1RM" value={Math.round(best)} unit="kg" tone="cyan" />
            <StatTile label="Sets done" value={doneSets} unit={`/ ${allSets}`} />
            <StatTile
              label="Target"
              value={LEVEL_LABEL[profile.level]}
              delta={GOAL_LABEL[profile.goal]}
              tone="muted"
            />
          </div>
        </Panel>

        {active.exercises.map((ex, exIdx) => {
          const last = lastPerformance(sessions, ex.name);
          const pb = prevBests.current[ex.name] ?? 0;
          const liveTop = Math.max(
            0,
            ...ex.sets.filter((s) => s.done).map((s) => estimate1RM(s.weightKg, s.reps)),
          );
          return (
            <Panel key={`${ex.name}-${exIdx}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">{ex.muscle}</p>
                  <h2 className="font-display font-semibold text-xl flex items-center gap-2">
                    <span className="truncate">{ex.name}</span>
                    {liveTop > 0 && liveTop > pb ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink gradient-brand rounded-full px-2 py-0.5">
                        <Trophy className="size-3" /> PR
                      </span>
                    ) : null}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {last
                      ? `Last: ${last.topWeightKg > 0 ? `${last.topWeightKg} kg × ` : ""}${last.topReps} reps on ${last.date}`
                      : "First time logging this exercise"}
                    {pb > 0 ? ` · best 1RM ${pb} kg` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" onClick={() => addSet(exIdx)}>
                    <Plus className="size-3.5" /> Set
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`View form cues for ${ex.name}`}
                    title="View form cues"
                    onClick={() => setSelectedExercise(EXERCISES.find((item) => item.name === ex.name) ?? null)}
                  >
                    <CircleHelp className="size-4" />
                  </Button>
                  <button
                    onClick={() => removeExercise(exIdx)}
                    aria-label={`Remove ${ex.name}`}
                    className="text-muted-foreground hover:text-rose"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {ex.sets.map((s, setIdx) => (
                  <div
                    key={setIdx}
                    className={`grid grid-cols-12 items-center gap-2 rounded-xl px-3 py-2.5 ${
                      s.done ? "bg-cyan/[0.08] border border-cyan/30" : "glass-tile"
                    }`}
                  >
                    <span className="col-span-2 sm:col-span-1 text-xs text-muted-foreground">
                      #{setIdx + 1}
                    </span>
                    <label className="col-span-4 sm:col-span-3 flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={s.weightKg === 0 ? "" : s.weightKg}
                        placeholder="0"
                        onChange={(e) =>
                          updateSet(exIdx, setIdx, { weightKg: Math.max(0, Number(e.target.value) || 0) })
                        }
                        className="w-full bg-transparent text-sm font-semibold outline-none"
                      />
                      <span className="text-xs text-muted-foreground">kg</span>
                    </label>
                    <label className="col-span-4 sm:col-span-2 flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={s.reps === 0 ? "" : s.reps}
                        placeholder="0"
                        onChange={(e) =>
                          updateSet(exIdx, setIdx, { reps: Math.max(0, Number(e.target.value) || 0) })
                        }
                        className="w-full bg-transparent text-sm font-semibold outline-none"
                      />
                      <span className="text-xs text-muted-foreground">reps</span>
                    </label>
                    <label className="hidden sm:flex col-span-2 items-center gap-1">
                      <select
                        value={s.rpe ?? ""}
                        onChange={(e) =>
                          updateSet(exIdx, setIdx, {
                            rpe: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        aria-label="Effort"
                        className="w-full bg-transparent text-xs font-semibold outline-none text-muted-foreground"
                      >
                        <option value="">RPE</option>
                        {[6, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((v) => (
                          <option key={v} value={v} className="bg-background">
                            RPE {v}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span className="hidden sm:block col-span-2 text-xs text-muted-foreground">
                      1RM {Math.round(estimate1RM(s.weightKg, s.reps))} kg
                    </span>
                    <div className="col-span-2 flex justify-end items-center gap-1">
                      <button
                        onClick={() => removeSet(exIdx, setIdx)}
                        aria-label={`Delete set ${setIdx + 1}`}
                        className="text-muted-foreground hover:text-rose"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const nextDone = !s.done;
                          updateSet(exIdx, setIdx, { done: nextDone });
                          if (nextDone) {
                            setRest(90);
                            setRestRunning(true);
                          }
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
              <input
                value={ex.note ?? ""}
                onChange={(e) => setExerciseNote(exIdx, e.target.value)}
                placeholder="Note (form cue, pain, tempo…)"
                className="mt-3 w-full bg-transparent text-xs text-muted-foreground outline-none border-b border-border/60 pb-1 focus:border-cyan/50"
              />
            </Panel>
          );
        })}

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display font-semibold text-lg">Add an exercise</h2>
            <Button size="sm" onClick={() => setPicker((p) => !p)}>
              {picker ? "Close" : "Browse library"}
            </Button>
          </div>
          {picker ? (
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-auto pr-1">
              {EXERCISES.filter(
                (e) => profile.equipment.includes(e.equipment) || e.equipment === "bodyweight",
              ).map((e) => (
                <button
                  key={e.name}
                  onClick={() => {
                    addExercise(
                      e.name,
                      e.muscle,
                      e.group === "cardio" ? 1 : 10,
                      e.bwRatio > 0 ? Math.round((profile.weightKg * e.bwRatio) / 2.5) * 2.5 : 0,
                    );
                    toast.success(`${e.name} added to this session.`);
                  }}
                  className="glass-tile rounded-xl px-3 py-2.5 text-left hover:bg-softer"
                >
                  <p className="text-sm font-semibold truncate">{e.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {e.muscle} · {e.equipment}
                  </p>
                </button>
              ))}
            </div>
          ) : null}
          <textarea
            value={active.notes ?? ""}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Session notes — sleep, energy, niggles…"
            rows={2}
            className="mt-4 w-full glass-tile rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan/50 resize-none"
          />
        </Panel>
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
        {plan.map((day) => {
          const lastDone = sessions.find((s) => s.title === day.title);
          return (
            <Panel key={day.id}>
              <p className="text-[11px] text-muted-foreground">{day.focus}</p>
              <h2 className="font-display font-bold text-2xl mb-1">{day.title}</h2>
              <p className="text-[11px] text-muted-foreground mb-3">
                {lastDone ? `Last done ${lastDone.date}` : "Not trained yet"}
              </p>
              <div className="space-y-1.5 mb-4">
                {day.exercises.map((ex) => {
                  const last = lastPerformance(sessions, ex.name);
                  return (
                    <div key={ex.name} className="flex items-center justify-between text-sm gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate">{ex.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`View form cues for ${ex.name}`}
                          title="View form cues"
                          onClick={() => setSelectedExercise(EXERCISES.find((item) => item.name === ex.name) ?? null)}
                          className="size-7 shrink-0 px-0 py-0"
                        >
                          <CircleHelp className="size-3.5" />
                        </Button>
                      </span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {ex.sets} × {ex.reps}
                        {last && last.topWeightKg > 0
                          ? ` @ ${last.topWeightKg}kg`
                          : ex.weightKg > 0
                            ? ` @ ${ex.weightKg}kg`
                            : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{day.durationMin} min</span>
                <Button variant="primary" size="sm" onClick={() => startSession(day)}>
                  Start
                </Button>
              </div>
            </Panel>
          );
        })}
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
        Loads start from what you actually lifted last time: hit every set at the target reps and the
        next session steps the weight up automatically.
      </Tile>
      <ExerciseDetailsDialog
        exercise={selectedExercise}
        open={selectedExercise !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedExercise(null);
        }}
      />
    </div>
  );
}
