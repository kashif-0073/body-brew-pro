import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart, Button, Eyebrow, Field, Panel, StatTile, Tile } from "@/components/ui-kit";
import { useStore, today } from "@/lib/store";
import {
  acwr,
  acwrVerdict,
  adherence,
  averageIntake,
  dailyNutrition,
  energyBalance,
  ffmi,
  GOAL_METRIC_FOCUS,
  leanMass,
  macroTargets,
  sessionBest1RM,
  sessionVolume,
  streak,
  vo2max,
  volumeInWindow,
  weeklySetsByMuscle,
  personalBests,
  weightTrend,
} from "@/lib/metrics";
import { GOAL_LABEL } from "@/lib/types";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & Metrics — PulseForge" },
      {
        name: "description",
        content:
          "Tonnage, estimated 1RM, weekly hard sets, VO₂ max and body composition trends over time.",
      },
      { property: "og:title", content: "Progress & Metrics — PulseForge" },
      {
        property: "og:description",
        content: "Tonnage, estimated 1RM, weekly hard sets, VO₂ max and body composition trends.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { state, hydrated, addBodyEntry, deleteSession } = useStore();
  const { profile, sessions, body, meals } = state;
  const [weight, setWeight] = useState<number | "">("");
  const [fat, setFat] = useState<number | "">("");
  const [openSession, setOpenSession] = useState<string | null>(null);

  const nutritionDays = useMemo(() => dailyNutrition(meals, 7), [meals]);

  const weekVolumes = useMemo(() => {
    const buckets = Array.from({ length: 8 }, () => 0);
    for (const s of sessions) {
      const weeksAgo = Math.floor(
        (Date.now() - new Date(s.date + "T00:00:00").getTime()) / (7 * 86_400_000),
      );
      if (weeksAgo >= 0 && weeksAgo < 8) buckets[7 - weeksAgo]! += sessionVolume(s);
    }
    return buckets;
  }, [sessions]);

  if (!hydrated) return <Panel className="h-64 animate-pulse" />;

  if (!profile) {
    return (
      <Panel className="text-center py-12">
        <h1 className="font-display font-bold text-2xl">Set up your profile first</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Metrics are calculated from your body stats and logged sessions.
        </p>
      </Panel>
    );
  }

  const load = acwr(sessions);
  const verdict = acwrVerdict(load);
  const sets = weeklySetsByMuscle(sessions);
  const best1RM = Math.max(0, ...sessions.map(sessionBest1RM));
  const firstBody = body[0];
  const lastBody = body[body.length - 1];
  const targets = macroTargets(profile);
  const avgIntake = averageIntake(nutritionDays);
  const balance = energyBalance(profile, meals, sessions, 7);
  const onTrack =
    avgIntake.loggedDays > 0 &&
    (profile.goal === "fatloss"
      ? balance.perDay < -150
      : profile.goal === "muscle" || profile.goal === "strength"
        ? balance.perDay > 100
        : Math.abs(balance.perDay) < 300);

  return (
    <div className="space-y-5">
      <Panel>
        <Eyebrow>Progress</Eyebrow>
        <h1 className="font-display font-bold text-3xl tracking-tight">
          {GOAL_LABEL[profile.goal]} metrics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Priority signal: {GOAL_METRIC_FOCUS[profile.goal]}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <StatTile
            label="7-day tonnage"
            value={Math.round(volumeInWindow(sessions, 7)).toLocaleString()}
            unit="kg"
          />
          <StatTile
            label="28-day tonnage"
            value={Math.round(volumeInWindow(sessions, 28)).toLocaleString()}
            unit="kg"
          />
          <StatTile label="Best est. 1RM" value={best1RM} unit="kg" tone="cyan" />
          <StatTile
            label="Acute:chronic load"
            value={load || "—"}
            delta={verdict.label}
            tone={verdict.tone === "good" ? "lime" : verdict.tone === "warn" ? "rose" : "muted"}
          />
        </div>
      </Panel>

      <div className="grid grid-cols-12 gap-5">
        <Panel className="col-span-12 xl:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Weekly tonnage</h2>
            <span className="text-[11px] text-muted-foreground">Last 8 weeks</span>
          </div>
          <BarChart values={weekVolumes} className="h-32" />
          <p className="text-[11px] text-muted-foreground mt-3">
            Training streak {streak(sessions)} days · {sessions.length} sessions logged
          </p>
        </Panel>

        <Panel className="col-span-12 xl:col-span-5">
          <h2 className="font-display font-semibold text-lg mb-4">Weekly hard sets per muscle</h2>
          <div className="space-y-2">
            {Object.entries(sets).length ? (
              Object.entries(sets)
                .sort((a, b) => b[1] - a[1])
                .map(([muscle, count]) => (
                  <div key={muscle}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{muscle}</span>
                      <span className="font-semibold">
                        {count}
                        <span className="text-muted-foreground text-xs"> sets</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-softer overflow-hidden">
                      <div
                        className={`h-full rounded-full ${count >= 10 && count <= 20 ? "gradient-brand" : "bg-rose"}`}
                        style={{ width: `${Math.min(100, (count / 20) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Log a session to see your weekly set distribution. The evidence-based hypertrophy
                window is 10–20 hard sets per muscle per week.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <Panel className="col-span-12 xl:col-span-5">
          <h2 className="font-display font-semibold text-lg mb-4">Body composition</h2>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <StatTile label="Weight" value={profile.weightKg} unit="kg" />
            <StatTile label="Body fat" value={profile.bodyFatPct} unit="%" />
            <StatTile label="Lean mass" value={leanMass(profile)} unit="kg" tone="cyan" />
            <StatTile label="FFMI" value={ffmi(profile)} />
            <StatTile label="VO₂ max" value={vo2max(profile)} unit="ml/kg" tone="cyan" />
            <StatTile
              label="Since start"
              value={
                firstBody && lastBody
                  ? `${(lastBody.weightKg - firstBody.weightKg).toFixed(1)}`
                  : "0.0"
              }
              unit="kg"
              tone="muted"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 items-end">
            <Field
              label="Weight"
              type="number"
              suffix="kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Field
              label="Body fat"
              type="number"
              suffix="%"
              value={fat}
              onChange={(e) => setFat(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Button
              variant="primary"
              onClick={() => {
                if (weight === "" || fat === "") {
                  toast.error("Enter both weight and body fat.");
                  return;
                }
                addBodyEntry({ date: today(), weightKg: Number(weight), bodyFatPct: Number(fat) });
                setWeight("");
                setFat("");
                toast.success("Body measurement saved.");
              }}
            >
              Add entry
            </Button>
          </div>
        </Panel>

        <Panel className="col-span-12 xl:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Session history</h2>
            <span className="text-[11px] text-muted-foreground">
              {sessions.length} logged · tap to expand
            </span>
          </div>
          <div className="space-y-2 max-h-[28rem] overflow-auto pr-1">
            {sessions.length ? (
              sessions.map((s) => {
                const open = openSession === s.id;
                const doneSets = s.exercises.reduce(
                  (t, e) => t + e.sets.filter((x) => x.done).length,
                  0,
                );
                return (
                  <Tile key={s.id} className="p-3">
                    <button
                      type="button"
                      onClick={() => setOpenSession(open ? null : s.id)}
                      className="w-full flex items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.date} · {s.focus} · {doneSets} sets ·{" "}
                          {s.elapsedMin ?? s.durationMin} min
                        </p>
                      </div>
                      <div className="text-right whitespace-nowrap text-sm">
                        <p className="font-semibold">
                          {Math.round(sessionVolume(s)).toLocaleString()}
                          <span className="text-muted-foreground text-xs"> kg</span>
                        </p>
                        <p className="text-[11px] text-cyan">1RM {sessionBest1RM(s)} kg</p>
                      </div>
                    </button>
                    {open && (
                      <div className="mt-3 space-y-2 border-t border-border pt-3">
                        {s.exercises.map((e) => (
                          <div key={e.name} className="text-sm">
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="font-medium truncate">{e.name}</span>
                              <span className="text-[11px] text-muted-foreground shrink-0">
                                {e.muscle}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {e.sets.map((set, i) => (
                                <span
                                  key={i}
                                  className={`rounded-md px-2 py-0.5 text-[11px] ${
                                    set.done
                                      ? "bg-softer text-foreground"
                                      : "bg-softer/50 text-muted-foreground line-through"
                                  }`}
                                >
                                  {set.weightKg > 0 ? `${set.weightKg} kg × ` : ""}
                                  {set.reps}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                        {s.notes ? (
                          <p className="text-[11px] text-muted-foreground italic">“{s.notes}”</p>
                        ) : null}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            deleteSession(s.id);
                            toast.success("Session deleted.");
                          }}
                        >
                          Delete session
                        </Button>
                      </div>
                    )}
                  </Tile>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No sessions yet. Start one from the Log tab and it will appear here with every set.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <Panel className="col-span-12 xl:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Eyebrow>Nutrition</Eyebrow>
              <h2 className="font-display font-semibold text-lg">Intake vs requirement</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">Last 7 days</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile
              label="Avg calories"
              value={avgIntake.kcal.toLocaleString()}
              unit={`/ ${targets.kcal.toLocaleString()}`}
              delta={`${adherence(avgIntake.kcal, targets.kcal)}%`}
              tone="cyan"
            />
            <StatTile
              label="Avg protein"
              value={avgIntake.protein}
              unit={`/ ${targets.protein} g`}
              delta={`${adherence(avgIntake.protein, targets.protein)}%`}
              tone="lime"
            />
            <StatTile label="Avg carbs" value={avgIntake.carbs} unit={`/ ${targets.carbs} g`} />
            <StatTile label="Avg fat" value={avgIntake.fat} unit={`/ ${targets.fat} g`} />
          </div>
          <div className="mt-5">
            <BarChart values={nutritionDays.map((d) => d.kcal)} className="h-24" />
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              {nutritionDays.map((d) => (
                <span key={d.date}>{d.date.slice(5)}</span>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Daily calories logged on {avgIntake.loggedDays} of 7 days · requirement{" "}
            {targets.kcal.toLocaleString()} kcal and {targets.protein} g protein for{" "}
            {GOAL_LABEL[profile.goal].toLowerCase()}.
          </p>
        </Panel>

        <Panel className="col-span-12 xl:col-span-5">
          <h2 className="font-display font-semibold text-lg mb-4">Energy balance</h2>
          <div className="grid grid-cols-2 gap-2">
            <StatTile
              label={`Intake (${balance.loggedDays}d logged)`}
              value={balance.intake.toLocaleString()}
              unit="kcal"
            />
            <StatTile
              label="Burn (same days)"
              value={balance.expenditure.toLocaleString()}
              unit="kcal"
              tone="muted"
            />
            <StatTile
              label="Net balance"
              value={`${balance.balance > 0 ? "+" : ""}${balance.balance.toLocaleString()}`}
              unit="kcal"
              tone={onTrack ? "lime" : "rose"}
            />
            <StatTile
              label="Per day"
              value={`${balance.perDay > 0 ? "+" : ""}${balance.perDay.toLocaleString()}`}
              unit="kcal"
              tone={onTrack ? "lime" : "rose"}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {avgIntake.loggedDays === 0
              ? "Log meals for a few days and this will show whether your intake matches your goal."
              : onTrack
                ? `On track — your balance supports ${GOAL_LABEL[profile.goal].toLowerCase()}. Expect roughly ${Math.abs(
                    +((balance.perDay * 7) / 7700).toFixed(2),
                  )} kg change per week at this rate.`
                : profile.goal === "fatloss"
                  ? "You're eating at or above maintenance — trim around 300–500 kcal a day to keep fat loss moving."
                  : profile.goal === "muscle" || profile.goal === "strength"
                    ? "You're below the surplus needed to build — add roughly 250–400 kcal a day, mostly carbs."
                    : "Intake is drifting from maintenance; keep it steady to support cardiovascular training."}
          </p>
          <p className="text-[11px] text-muted-foreground mt-3">
            Burn = Mifflin-St Jeor BMR × activity factor, plus an estimate from logged tonnage.
          </p>
        </Panel>
      </div>
    </div>
  );
}
