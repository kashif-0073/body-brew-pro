import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { Button, ChoiceRow, Eyebrow, Field, Panel, Ring, StatTile } from "@/components/ui-kit";
import { useStore, today } from "@/lib/store";
import { macroTargets } from "@/lib/metrics";
import { estimateMeal } from "@/lib/ai.functions";
import type { Meal } from "@/lib/types";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Calorie & Protein Tracker — PulseForge" },
      {
        name: "description",
        content: "Track calories, protein, carbs and fat with manual entry or AI meal estimates.",
      },
      { property: "og:title", content: "Calorie & Protein Tracker — PulseForge" },
      {
        property: "og:description",
        content: "Track calories, protein, carbs and fat with manual entry or AI meal estimates.",
      },
    ],
  }),
  component: NutritionPage,
});

type Slot = Meal["slot"];

function NutritionPage() {
  const { state, hydrated, addMeal, removeMeal } = useStore();
  const estimate = useServerFn(estimateMeal);
  const [slot, setSlot] = useState<Slot>("breakfast");
  const [manual, setManual] = useState({ name: "", kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!hydrated) return <Panel className="h-64 animate-pulse" />;
  const { profile, meals } = state;

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
  const todays = meals.filter((m) => m.date === today());
  const totals = todays.reduce(
    (t, m) => ({
      kcal: t.kcal + m.kcal,
      protein: t.protein + m.protein,
      carbs: t.carbs + m.carbs,
      fat: t.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const saveManual = () => {
    if (!manual.name.trim()) {
      toast.error("Give the meal a name.");
      return;
    }
    addMeal({ ...manual, slot });
    setManual({ name: "", kcal: 0, protein: 0, carbs: 0, fat: 0 });
    toast.success("Meal logged.");
  };

  const runAi = async () => {
    if (description.trim().length < 3) {
      toast.error("Describe what you ate first.");
      return;
    }
    setLoading(true);
    try {
      const out = await estimate({ data: { description } });
      addMeal({ ...out, slot });
      setDescription("");
      toast.success(`${out.name} · ${out.kcal} kcal · ${out.protein} g protein`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not estimate that meal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-5">
      <Panel className="col-span-12 lg:col-span-4" float>
        <Eyebrow>Today</Eyebrow>
        <h1 className="font-display font-bold text-2xl mb-4">Macro budget</h1>
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
            label="Remaining"
            value={Math.max(0, targets.kcal - totals.kcal).toLocaleString()}
            unit="kcal"
          />
          <StatTile
            label="Protein left"
            value={Math.max(0, targets.protein - totals.protein)}
            unit="g"
            tone="cyan"
          />
        </div>
      </Panel>

      <div className="col-span-12 lg:col-span-8 space-y-5">
        <Panel>
          <Eyebrow className="text-violet">AI meal entry</Eyebrow>
          <h2 className="font-display font-bold text-2xl mb-3">Describe what you ate</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. two eggs, 80 g oats with milk and a banana"
              className="flex-1 glass-tile rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan/50"
            />
            <Button variant="primary" onClick={() => void runAi()} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Estimating…" : "Estimate & log"}
            </Button>
          </div>
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
              value={manual.kcal}
              onChange={(e) => setManual({ ...manual, kcal: Number(e.target.value) })}
            />
            <Field
              label="Protein"
              type="number"
              suffix="g"
              value={manual.protein}
              onChange={(e) => setManual({ ...manual, protein: Number(e.target.value) })}
            />
            <Field
              label="Carbs"
              type="number"
              suffix="g"
              value={manual.carbs}
              onChange={(e) => setManual({ ...manual, carbs: Number(e.target.value) })}
            />
            <Field
              label="Fat"
              type="number"
              suffix="g"
              value={manual.fat}
              onChange={(e) => setManual({ ...manual, fat: Number(e.target.value) })}
            />
            <div className="flex items-end">
              <Button variant="primary" className="w-full" onClick={saveManual}>
                Log meal
              </Button>
            </div>
          </div>
        </Panel>

        <Panel>
          <h2 className="font-display font-semibold text-lg mb-4">Today's meals</h2>
          <div className="space-y-2">
            {todays.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between glass-tile rounded-xl px-3 py-2.5 text-sm gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{m.slot}</p>
                </div>
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <span className="text-muted-foreground">
                    {m.kcal} kcal · <span className="text-lime">{m.protein} g P</span>
                  </span>
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
            {!todays.length ? (
              <p className="text-sm text-muted-foreground">No meals logged today yet.</p>
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
