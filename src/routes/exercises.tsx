import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ExerciseDetailsDialog } from "@/components/ExerciseDetailsDialog";
import { Button, Eyebrow, Panel } from "@/components/ui-kit";
import { EXERCISES, REGIONS, regionOf, type ExerciseDef, type Region } from "@/lib/exercises";
import { EQUIPMENT_LABEL, LEVEL_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: [
      { title: "Exercise Library — PulseForge" },
      {
        name: "description",
        content: "Browse exercises by body area and learn each movement with step-by-step form cues.",
      },
      { property: "og:title", content: "Exercise Library — PulseForge" },
      {
        property: "og:description",
        content: "Browse exercises by body area and learn each movement with step-by-step form cues.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExercisesPage,
});

function ExercisesPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "All">("All");
  const [selected, setSelected] = useState<ExerciseDef | null>(null);

  const exercises = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return EXERCISES.filter((exercise) => {
      const matchesRegion = region === "All" || regionOf(exercise.muscle) === region;
      const matchesQuery =
        !normalized ||
        exercise.name.toLowerCase().includes(normalized) ||
        exercise.muscle.toLowerCase().includes(normalized) ||
        EQUIPMENT_LABEL[exercise.equipment].toLowerCase().includes(normalized);
      return matchesRegion && matchesQuery;
    });
  }, [query, region]);

  return (
    <div className="space-y-5">
      <section className="border-b border-border pb-5">
        <Eyebrow>Movement reference</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Exercise library</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Find a movement, then open its technique guide before your next set.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{exercises.length} exercises</p>
        </div>
      </section>

      <div className="space-y-3">
        <label className="glass-tile flex items-center gap-3 rounded-xl px-4 py-3 focus-within:border-cyan/50">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Search exercises</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by exercise, muscle, or equipment"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
              Clear
            </Button>
          ) : null}
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter by body area">
          {["All" as const, ...REGIONS].map((item) => (
            <Button
              key={item}
              size="sm"
              variant={region === item ? "primary" : "outline"}
              onClick={() => setRegion(item)}
              aria-pressed={region === item}
              className="shrink-0"
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {exercises.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {exercises.map((exercise) => (
            <button
              key={exercise.name}
              onClick={() => setSelected(exercise)}
              className="glass-panel group rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-cyan/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase text-cyan">{regionOf(exercise.muscle)}</p>
                  <h2 className="mt-1 truncate font-display text-lg font-semibold">{exercise.name}</h2>
                </div>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-softer text-muted-foreground transition-colors group-hover:text-cyan">
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full bg-softer px-2 py-1">{exercise.muscle}</span>
                <span className="rounded-full bg-softer px-2 py-1">
                  {EQUIPMENT_LABEL[exercise.equipment]}
                </span>
                <span className="rounded-full bg-softer px-2 py-1">{LEVEL_LABEL[exercise.minLevel]}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Panel className="py-12 text-center">
          <BookOpen className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 font-display text-lg font-semibold">No matching exercises</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try another search or body area.</p>
          <Button
            className="mt-4"
            onClick={() => {
              setQuery("");
              setRegion("All");
            }}
          >
            Reset filters
          </Button>
        </Panel>
      )}

      <ExerciseDetailsDialog
        exercise={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}