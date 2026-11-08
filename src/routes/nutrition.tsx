import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplets,
  Star,
  Trash2,
} from "lucide-react";
import { Button, ChoiceRow, Eyebrow, Field, Panel, Ring, StatTile } from "@/components/ui-kit";
import { useStore, today } from "@/lib/store";
import { macroTargets, waterTarget } from "@/lib/metrics";
import type { Meal } from "@/lib/types";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Calorie & Protein Tracker — PulseForge" },
      {
        name: "description",
        content: "Track calories, protein, carbs, fat and hydration with quick manual entry.",
      },
      { property: "og:title", content: "Calorie & Protein Tracker — PulseForge" },
      {
        property: "og:description",
        content: "Track calories, protein, carbs, fat and hydration with quick manual entry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NutritionPage,
});

type Slot = Meal["slot"];

const shift = (date: string, days: number) =>
  new Date(new Date(date + "T00:00:00").getTime() + days * 86_400_000).toISOString().slice(0, 10);

function NutritionPage() {
  const {
    state,
    hydrated,
    addMeal,
    removeMeal,
    copyMeals,
    addFavorite,
    removeFavorite,
    addWater,
  } = useStore();
  const [date, setDate] = useState(today());
  const [slot, setSlot] = useState<Slot>("breakfast");
  const [manual, setManual] = useState({ name: "", kcal: 0, protein: 0, carbs: 0, fat: 0 });

  if (!hydrated) return <Panel className="h-64 animate-pulse" />;
  const { profile, meals, favorites, water, sessions } = state;

  if (!profile) {
    return (
      <Panel className="text-center py-12">
        <h1 className="font-display font-bold text-2xl">Set up your profile first</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Calorie and protein targets come from your body stats and goal.
        </p>
      </Panel>
    );
  }

  const targets = macroTargets(profile);
  const dayMeals = meals.filter((m) => m.date === date);
  const totals = dayMeals.reduce(
    (t, m) => ({
      kcal: t.kcal + m.kcal,
      protein: t.protein + m.protein,
      carbs: t.carbs + m.carbs,
      fat: t.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const trainedToday = sessions.some((s) => s.date === date);
  const waterMl = water.find((w) => w.date === date)?.ml ?? 0;
  const waterGoal = waterTarget(profile.weightKg, trainedToday);
  const isToday = date === today();

  const saveManual = () => {
    if (!manual.name.trim()) {
      toast.error("Give the meal a name.");
      return;
    }
    if (manual.kcal <= 0 && manual.protein <= 0 && manual.carbs <= 0 && manual.fat <= 0) {
      toast.error("Add at least calories or a macro.");
      return;
    }
    addMeal({ ...manual, slot, date });
    setManual({ name: "", kcal: 0, protein: 0, carbs: 0, fat: 0 });
    toast.success("Meal logged.");
  };


  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-4 space-y-5">
        <Panel>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Eyebrow>{isToday ? "Today" : date}</Eyebrow>
              <h1 className="font-display font-bold text-2xl">Macro budget</h1>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="Previous day"
                onClick={() => setDate((d) => shift(d, -1))}
                className="glass-tile rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                aria-label="Next day"
                disabled={isToday}
                onClick={() => setDate((d) => shift(d, 1))}
                className="glass-tile rounded-lg p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-5">
            <Ring value={totals.kcal} max={targets.kcal} label={totals.kcal.toLocaleString()} size={96} />
            <div className="space-y-2 text-sm w-full">
              <Line label="Calories" value={totals.kcal} target={targets.kcal} unit="" color="bg-cyan" />
              <Line label="Protein" value={totals.protein} target={targets.protein} unit="g" color="bg-lime" />
              <Line label="Carbs" value={totals.carbs} target={targets.carbs} unit="g" color="bg-violet" />
              <Line label="Fat" value={totals.fat} target={targets.fat} unit="g" color="bg-rose" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatTile
              label={totals.kcal > targets.kcal ? "Over budget" : "Remaining"}
              value={Math.abs(targets.kcal - totals.kcal).toLocaleString()}
              unit="kcal"
              tone={totals.kcal > targets.kcal ? "rose" : "lime"}
              delta={totals.kcal > targets.kcal ? "above target" : "left today"}
            />
            <StatTile
              label="Protein left"
              value={Math.max(0, targets.protein - totals.protein)}
              unit="g"
              tone="cyan"
            />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="size-4 text-cyan" />
              <h2 className="font-display font-semibold text-lg">Hydration</h2>
            </div>
            <span className="text-sm text-muted-foreground tabular-nums">
              {(waterMl / 1000).toFixed(2)} / {(waterGoal / 1000).toFixed(1)} L
            </span>
          </div>
          <div className="h-2 rounded-full bg-softer overflow-hidden mb-3">
            <div
              className="h-full bg-cyan rounded-full transition-all"
              style={{ width: `${Math.min(100, (waterMl / waterGoal) * 100)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[250, 500, 750].map((ml) => (
              <Button key={ml} size="sm" onClick={() => addWater(ml, date)}>
                +{ml} ml
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => addWater(-250, date)}>
              −250 ml
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Target is 35 ml per kg of bodyweight{trainedToday ? ", plus 500 ml for training today" : ""}.
          </p>
        </Panel>

        {favorites.length ? (
          <Panel>
            <h2 className="font-display font-semibold text-lg mb-3">Quick add</h2>
            <div className="flex flex-wrap gap-2">
              {favorites.map((f) => (
                <span key={f.id} className="glass-tile rounded-xl flex items-center overflow-hidden">
                  <button
                    onClick={() => {
                      addMeal({ ...f, slot, date });
                      toast.success(`${f.name} logged.`);
                    }}
                    className="px-3 py-2 text-xs font-semibold hover:bg-softer"
                  >
                    {f.name}
                    <span className="text-muted-foreground"> · {f.kcal} kcal</span>
                  </button>
                  <button
                    aria-label={`Remove ${f.name} from quick add`}
                    onClick={() => removeFavorite(f.id)}
                    className="px-2 py-2 text-muted-foreground hover:text-rose"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>

      <div className="col-span-12 lg:col-span-8 space-y-5">
        <Panel>
          <Eyebrow>Meal slot</Eyebrow>
          <h2 className="font-display font-bold text-2xl mb-1">Which meal are you logging?</h2>
          <div className="mt-4">
            <ChoiceRow<Slot>
              label="Meal slot"
              value={slot}
              onChange={setSlot}
              options={[
                { value: "breakfast", label: "Breakfast" },
                { value: "lunch", label: "Lunch" },
                { value: "dinner", label: "Dinner" },
                { value: "snack", label: "Snack" },
              ]}
            />
          </div>
        </Panel>

        <Panel>
          <Eyebrow>Manual entry</Eyebrow>
          <h2 className="font-display font-bold text-2xl mb-4">Exact numbers</h2>
          <div className="grid sm:grid-cols-5 gap-3">
            <div className="sm:col-span-5">
              <Field
                label="Food"
                value={manual.name}
                onChange={(e) => setManual({ ...manual, name: e.target.value })}
                placeholder="Chicken and rice bowl"
              />
            </div>
            <Field
              label="Calories"
              type="number"
              suffix="kcal"
              value={manual.kcal === 0 ? "" : manual.kcal}
              placeholder="0"
              onChange={(e) => setManual({ ...manual, kcal: Math.max(0, Number(e.target.value) || 0) })}
            />
            <Field
              label="Protein"
              type="number"
              suffix="g"
              value={manual.protein === 0 ? "" : manual.protein}
              placeholder="0"
              onChange={(e) =>
                setManual({ ...manual, protein: Math.max(0, Number(e.target.value) || 0) })
              }
            />
            <Field
              label="Carbs"
              type="number"
              suffix="g"
              value={manual.carbs === 0 ? "" : manual.carbs}
              placeholder="0"
              onChange={(e) => setManual({ ...manual, carbs: Math.max(0, Number(e.target.value) || 0) })}
            />
            <Field
              label="Fat"
              type="number"
              suffix="g"
              value={manual.fat === 0 ? "" : manual.fat}
              placeholder="0"
              onChange={(e) => setManual({ ...manual, fat: Math.max(0, Number(e.target.value) || 0) })}
            />
            <div className="flex items-end">
              <Button variant="primary" className="w-full" onClick={saveManual}>
                Log meal
              </Button>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-display font-semibold text-lg">
              {isToday ? "Today's meals" : `Meals on ${date}`}
            </h2>
            <Button
              size="sm"
              onClick={() => {
                const n = copyMeals(shift(date, -1), date);
                if (n) toast.success(`Copied ${n} meals from the previous day.`);
                else toast.error("Nothing logged the day before.");
              }}
            >
              <Copy className="size-3.5" /> Copy previous day
            </Button>
          </div>
          <div className="space-y-2">
            {dayMeals.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between glass-tile rounded-xl px-3 py-2.5 text-sm gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">
                    {m.slot} · {m.carbs} g C · {m.fat} g F
                  </p>
                </div>
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <span className="text-muted-foreground">
                    {m.kcal} kcal · <span className="text-lime">{m.protein} g P</span>
                  </span>
                  <button
                    onClick={() => {
                      addFavorite({
                        name: m.name,
                        kcal: m.kcal,
                        protein: m.protein,
                        carbs: m.carbs,
                        fat: m.fat,
                      });
                      toast.success(`${m.name} saved to quick add.`);
                    }}
                    aria-label={`Save ${m.name} to quick add`}
                    className="text-muted-foreground hover:text-lime"
                  >
                    <Star className="size-4" />
                  </button>
                  <button
                    onClick={() => removeMeal(m.id)}
                    aria-label={`Remove ${m.name}`}
                    className="text-muted-foreground hover:text-rose"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
            {!dayMeals.length ? (
              <p className="text-sm text-muted-foreground">Nothing logged for this day yet.</p>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm">
        <span className={`size-2 rounded-full ${color}`} />
        <span className="text-muted-foreground">{label}</span>
        <span className="ml-auto font-semibold">
          {value.toLocaleString()} / {target.toLocaleString()} {unit}
        </span>
      </p>
      <div className="mt-1 h-1.5 rounded-full bg-softer overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, target > 0 ? (value / target) * 100 : 0)}%` }}
        />
      </div>
    </div>
  );
}
