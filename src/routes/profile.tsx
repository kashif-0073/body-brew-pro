import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, ChoiceRow, Eyebrow, Field, Panel, StatTile } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { bmr, ffmi, leanMass, macroTargets, tdee, vo2max } from "@/lib/metrics";
import type { Activity, Equipment, Goal, Level, Profile, Sex } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Athlete Profile — PulseForge" },
      {
        name: "description",
        content: "Set your experience level, training goal, equipment and body metrics.",
      },
      { property: "og:title", content: "Athlete Profile — PulseForge" },
      {
        property: "og:description",
        content: "Set your experience level, training goal, equipment and body metrics.",
      },
    ],
  }),
  component: ProfilePage,
});

const DEFAULT: Profile = {
  name: "Athlete",
  level: "beginner",
  goal: "muscle",
  daysPerWeek: 4,
  equipment: ["bodyweight", "dumbbell"],
  sex: "male",
  age: 28,
  heightCm: 178,
  weightKg: 78,
  bodyFatPct: 18,
  restingHr: 62,
  activity: "moderate",
};

function ProfilePage() {
  const { state, hydrated, saveProfile, regeneratePlan, reset, exportState, importState } =
    useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState<Profile>(DEFAULT);

  useEffect(() => {
    if (state.profile) setForm(state.profile);
  }, [state.profile]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleEquipment = (e: Equipment) =>
    setForm((f) => ({
      ...f,
      equipment: f.equipment.includes(e)
        ? f.equipment.filter((x) => x !== e)
        : [...f.equipment, e],
    }));

  const submit = () => {
    if (!form.equipment.length) {
      toast.error("Pick at least one type of equipment.");
      return;
    }
    saveProfile(form);
    toast.success("Profile saved — your plan has been rebuilt.");
    void navigate({ to: "/" });
  };

  const targets = macroTargets(form);

  if (!hydrated) return <Panel className="h-64 animate-pulse" />;

  return (
    <div className="grid grid-cols-12 gap-5">
      <Panel className="col-span-12 lg:col-span-8">
        <Eyebrow>Athlete profile</Eyebrow>
        <h1 className="font-display font-bold text-3xl tracking-tight mb-6">
          Your training inputs
        </h1>

        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your name"
            />
            <Field
              label="Age"
              type="number"
              value={form.age}
              suffix="yrs"
              onChange={(e) => set("age", Number(e.target.value))}
            />
          </div>

          <ChoiceRow<Level>
            label="Experience level"
            value={form.level}
            onChange={(v) => set("level", v)}
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "professional", label: "Professional" },
            ]}
          />

          <ChoiceRow<Goal>
            label="Primary goal"
            value={form.goal}
            onChange={(v) => set("goal", v)}
            options={[
              { value: "muscle", label: "Muscle building" },
              { value: "fatloss", label: "Fat loss" },
              { value: "cardio", label: "Cardiovascular health" },
              { value: "strength", label: "Strength" },
            ]}
          />

          <ChoiceRow<Equipment>
            label="Available equipment"
            multi
            value={form.equipment}
            onChange={toggleEquipment}
            options={[
              { value: "bodyweight", label: "Bodyweight" },
              { value: "dumbbell", label: "Dumbbells" },
              { value: "barbell", label: "Barbell" },
              { value: "machine", label: "Machines" },
              { value: "cardio", label: "Cardio machines" },
            ]}
          />

          <ChoiceRow<string>
            label="Training days per week"
            value={String(form.daysPerWeek)}
            onChange={(v) => set("daysPerWeek", Number(v))}
            options={[2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} days` }))}
          />

          <ChoiceRow<Sex>
            label="Sex (for metabolic formulas)"
            value={form.sex}
            onChange={(v) => set("sex", v)}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />

          <ChoiceRow<Activity>
            label="Daily activity outside training"
            value={form.activity}
            onChange={(v) => set("activity", v)}
            options={[
              { value: "sedentary", label: "Sedentary" },
              { value: "light", label: "Light" },
              { value: "moderate", label: "Moderate" },
              { value: "high", label: "High" },
              { value: "athlete", label: "Athlete" },
            ]}
          />

          <div className="grid sm:grid-cols-4 gap-3">
            <Field
              label="Height"
              type="number"
              suffix="cm"
              value={form.heightCm}
              onChange={(e) => set("heightCm", Number(e.target.value))}
            />
            <Field
              label="Weight"
              type="number"
              suffix="kg"
              value={form.weightKg}
              onChange={(e) => set("weightKg", Number(e.target.value))}
            />
            <Field
              label="Body fat"
              type="number"
              suffix="%"
              value={form.bodyFatPct}
              onChange={(e) => set("bodyFatPct", Number(e.target.value))}
            />
            <Field
              label="Resting HR"
              type="number"
              suffix="bpm"
              value={form.restingHr}
              onChange={(e) => set("restingHr", Number(e.target.value))}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="primary" onClick={submit}>
              Save & rebuild plan
            </Button>
            {state.profile ? (
              <Button
                onClick={() => {
                  regeneratePlan();
                  toast.success("Plan regenerated.");
                }}
              >
                Regenerate plan only
              </Button>
            ) : null}
            {state.profile ? (
              <Button
                variant="danger"
                onClick={() => {
                  reset();
                  setForm(DEFAULT);
                  toast.success("All local data cleared.");
                }}
              >
                Clear all data
              </Button>
            ) : null}
          </div>
        </div>
      </Panel>

      <div className="col-span-12 lg:col-span-4 space-y-5">
        <Panel float>
          <Eyebrow>Derived metrics</Eyebrow>
          <h2 className="font-display font-bold text-xl mb-4">Live calculations</h2>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="BMR" value={bmr(form).toLocaleString()} unit="kcal" />
            <StatTile label="Maintenance" value={tdee(form).toLocaleString()} unit="kcal" />
            <StatTile label="Lean mass" value={leanMass(form)} unit="kg" />
            <StatTile label="FFMI" value={ffmi(form)} />
            <StatTile label="VO₂ max" value={vo2max(form)} unit="ml/kg" />
            <StatTile label="Target kcal" value={targets.kcal.toLocaleString()} unit="kcal" tone="cyan" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Mifflin-St Jeor energy expenditure, HR-reserve VO₂ estimate and goal-adjusted macros:
            {" "}
            {targets.protein} g protein · {targets.carbs} g carbs · {targets.fat} g fat.
          </p>
        </Panel>

        <Panel>
          <Eyebrow>Backup</Eyebrow>
          <h2 className="font-display font-bold text-xl mb-2">Move your data</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Everything stays in this browser. Save a backup file to keep it safe or move it to
            another device.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                const blob = new Blob([exportState()], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `pulseforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Backup downloaded.");
              }}
            >
              Download backup
            </Button>
            <label className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm px-4 py-2.5 glass-tile hover:bg-softer cursor-pointer">
              Restore backup
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    importState(await file.text());
                    toast.success("Backup restored.");
                  } catch {
                    toast.error("That file isn't a PulseForge backup.");
                  }
                }}
              />
            </label>
          </div>
        </Panel>
      </div>
    </div>
  );
}
