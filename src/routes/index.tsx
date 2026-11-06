import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { BarChart, Button, Eyebrow, Panel, Ring, StatTile, Tile } from "@/components/ui-kit";
import { useStore, today } from "@/lib/store";
import {
  acwr,
  acwrVerdict,
  ffmi,
  leanMass,
  macroTargets,
  sessionVolume,
  streak,
  vo2max,
  volumeInWindow,
} from "@/lib/metrics";
import { EQUIPMENT_LABEL, GOAL_LABEL, LEVEL_LABEL } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulseForge Dashboard — Today's Training" },
      {
        name: "description",
        content:
          "Your training day, live progress metrics and macro totals in one adaptive dashboard.",
      },
      { property: "og:title", content: "PulseForge Dashboard — Today's Training" },
      {
        property: "og:description",
        content: "Your training day, live progress metrics and macro totals in one dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, hydrated, startSession } = useStore();
  const navigate = useNavigate();
  const { profile, plan, sessions, meals } = state;

  const todaysDay = useMemo(() => {
    if (!plan.length) return null;
    return plan[sessions.length % plan.length] ?? plan[0]!;
  }, [plan, sessions.length]);

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

  if (!hydrated) {
    return <Panel className="h-64 animate-pulse" />;
  }

  if (!profile) {
    return (
      <Panel className="max-w-2xl mx-auto text-center py-14" float>
        <Eyebrow className="text-violet">Welcome</Eyebrow>
        <h1 className="font-display font-bold text-4xl tracking-tight">Build your athlete profile</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          Tell us your experience, goal and equipment. PulseForge builds a weekly plan, calorie and
          protein targets, and tracks every set you lift.
        </p>
        <Link to="/profile" className="inline-block mt-6">
          <Button variant="primary">Start setup</Button>
        </Link>
      </Panel>
    );
  }

  const targets = macroTargets(profile);
  const eatenToday = meals
    .filter((m) => m.date === today())
    .reduce(
      (t, m) => ({ kcal: t.kcal + m.kcal, protein: t.protein + m.protein }),
      { kcal: 0, protein: 0 },
    );
  const load = acwr(sessions);
  const verdict = acwrVerdict(load);

  return (
    <div className="grid grid-cols-12 gap-5">
      <aside className="col-span-12 lg:col-span-3">
        <Panel float>
          <Eyebrow>Athlete profile</Eyebrow>
          <h2 className="font-display font-bold text-2xl leading-tight mb-4">{profile.name}</h2>
          <div className="space-y-3 text-sm">
            <Row label="Level" value={LEVEL_LABEL[profile.level]} />
            <Row label="Goal" value={GOAL_LABEL[profile.goal]} accent />
            <Row label="Days / wk" value={String(profile.daysPerWeek)} />
            <Row
              label="Equipment"
              value={profile.equipment.map((e) => EQUIPMENT_LABEL[e]).join(", ") || "—"}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Body stats</span>
              <span className="text-foreground/80">{profile.weightKg} kg</span>
            </div>
            <div className="h-1.5 rounded-full bg-softer overflow-hidden">
              <div
                className="h-full gradient-brand rounded-full"
                style={{ width: `${Math.min(100, (leanMass(profile) / profile.weightKg) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Body fat {profile.bodyFatPct}% · Lean {leanMass(profile)} kg · FFMI {ffmi(profile)}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <StatTile label="Streak" value={streak(sessions)} unit="days" />
            <StatTile label="Sessions" value={sessions.length} unit="logged" />
          </div>
        </Panel>
      </aside>

      <main className="col-span-12 lg:col-span-9 space-y-5">
        <WeekStrip sessionDates={sessions.map((x) => x.date)} />
        <Panel className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-cyan/20 blur-3xl" />
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <p className="label-eyebrow text-violet mb-1">Today · {todaysDay?.focus ?? "Rest"}</p>
              <h1 className="font-display font-bold text-4xl tracking-tight">
                {todaysDay?.title ?? "No plan yet"}{" "}
                <span className="text-cyan">
                  {String((sessions.length % Math.max(1, plan.length)) + 1).padStart(2, "0")}
                </span>
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs bg-lime/15 text-lime border border-lime/20 rounded-full px-3 py-1">
                {todaysDay?.durationMin ?? 0} min
              </span>
              <span className="text-xs glass-tile rounded-full px-3 py-1">
                {todaysDay?.exercises.length ?? 0} exercises
              </span>
              {todaysDay ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    startSession(todaysDay);
                    void navigate({ to: "/workout" });
                  }}
                >
                  {state.active ? "Resume session" : "Start session"}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {(todaysDay?.exercises ?? []).map((ex, i) => (
              <Tile key={ex.name} className={i === 0 ? "border-cyan/30 bg-cyan/[0.06]" : ""}>
                <p className="text-[11px] text-muted-foreground mb-1">{ex.muscle}</p>
                <p className="font-display font-semibold text-lg">
                  {ex.name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {ex.sets} × {ex.reps}
                  {ex.weightKg > 0 ? ` @ ${ex.weightKg} kg` : " · bodyweight"}
                </p>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: ex.sets }).map((_, s) => (
                    <span
                      key={s}
                      className="size-6 rounded-md bg-softer grid place-items-center text-xs text-muted-foreground"
                    >
                      {s + 1}
                    </span>
                  ))}
                </div>
              </Tile>
            ))}
          </div>
        </Panel>

        <div className="grid grid-cols-12 gap-5">
          <Panel className="col-span-12 xl:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Progress Metrics</h3>
              <Link to="/progress" className="text-[11px] text-muted-foreground hover:text-foreground">
                Last 8 weeks →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <StatTile
                label="7-day volume"
                value={Math.round(volumeInWindow(sessions, 7)).toLocaleString()}
                unit="kg"
              />
              <StatTile
                label="Load ratio"
                value={load || "—"}
                delta={verdict.label}
                tone={verdict.tone === "good" ? "lime" : verdict.tone === "warn" ? "rose" : "muted"}
              />
              <StatTile label="VO₂ max" value={vo2max(profile)} unit="ml/kg" delta="Est. from HR" tone="cyan" />
            </div>
            <BarChart values={weekVolumes} />
            <p className="text-[11px] text-muted-foreground mt-3">
              Weekly tonnage · focus: {GOAL_LABEL[profile.goal]}
            </p>
          </Panel>

          <Panel className="col-span-12 xl:col-span-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Nutrition</h3>
              <Link to="/nutrition">
                <Button variant="primary" size="sm">
                  Log meal
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <Ring
                value={eatenToday.kcal}
                max={targets.kcal}
                label={eatenToday.kcal.toLocaleString()}
              />
              <div className="space-y-2 text-sm w-full">
                <p className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-cyan" />
                  <span className="text-muted-foreground">Calories</span>
                  <span className="ml-auto font-semibold">
                    {eatenToday.kcal.toLocaleString()} / {targets.kcal.toLocaleString()}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-lime" />
                  <span className="text-muted-foreground">Protein</span>
                  <span className="ml-auto font-semibold">
                    {eatenToday.protein} / {targets.protein} g
                  </span>
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {meals.filter((m) => m.date === today()).slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between glass-tile rounded-xl px-3 py-2.5 text-sm"
                >
                  <span className="truncate pr-2">{m.name}</span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {m.protein} g · {m.kcal} cal
                  </span>
                </div>
              ))}
              {!meals.some((m) => m.date === today()) ? (
                <p className="text-sm text-muted-foreground">
                  Nothing logged today. Add a meal by hand or describe it and let AI estimate it.
                </p>
              ) : null}
            </div>
          </Panel>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold text-right ${accent ? "text-lime" : ""}`}>{value}</span>
    </div>
  );
}

function WeekStrip({ sessionDates }: { sessionDates: string[] }) {
  const trained = new Set(sessionDates);
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { key, d, isToday: key === today(), done: trained.has(key), future: d > now };
  });
  const count = days.filter((d) => d.done).length;
  return (
    <Panel className="py-4">
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>This week</Eyebrow>
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-cyan">{count}</span> workout{count === 1 ? "" : "s"} logged
        </span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.key}
            aria-label={`${day.d.toLocaleDateString(undefined, { weekday: "long" })}: ${day.done ? "trained" : "no workout"}`}
            className={`flex flex-col items-center gap-1.5 rounded-xl py-2 transition-colors ${
              day.isToday ? "border border-cyan/40 bg-cyan/[0.06]" : "glass-tile"
            } ${day.future ? "opacity-50" : ""}`}
          >
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {day.d.toLocaleDateString(undefined, { weekday: "narrow" })}
            </span>
            <span className="font-display font-semibold text-sm">{day.d.getDate()}</span>
            <span
              className={`size-2 rounded-full ${
                day.done ? "gradient-brand shadow-[0_0_10px_var(--cyan)]" : "bg-muted-foreground/30"
              }`}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
}
