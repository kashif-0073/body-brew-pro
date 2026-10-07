type Part =
  | "chest" | "shoulders" | "biceps" | "triceps" | "abs" | "quads" | "calves"
  | "back" | "reardelts" | "glutes" | "hamstrings";

const MAP: Record<string, { primary: Part[]; secondary: Part[] }> = {
  Chest: { primary: ["chest"], secondary: ["shoulders", "triceps"] },
  Back: { primary: ["back"], secondary: ["biceps", "reardelts"] },
  Shoulders: { primary: ["shoulders"], secondary: ["triceps"] },
  "Rear delts": { primary: ["reardelts"], secondary: ["back"] },
  Biceps: { primary: ["biceps"], secondary: [] },
  Triceps: { primary: ["triceps"], secondary: ["shoulders"] },
  Core: { primary: ["abs"], secondary: [] },
  Quads: { primary: ["quads"], secondary: ["glutes"] },
  Glutes: { primary: ["glutes"], secondary: ["hamstrings"] },
  Hamstrings: { primary: ["hamstrings"], secondary: ["glutes"] },
  Calves: { primary: ["calves"], secondary: [] },
  "Posterior chain": { primary: ["hamstrings", "glutes"], secondary: ["back"] },
  Cardio: { primary: ["quads"], secondary: ["calves", "hamstrings", "glutes"] },
};

function Figure({ view, tone }: { view: "front" | "back"; tone: (p: Part) => string }) {
  const s = (p: Part) => `${tone(p)} transition-colors`;
  const base = "fill-softer";
  return (
    <svg viewBox="0 0 100 220" className="h-56 w-auto" role="img" aria-label={`${view} view`}>
      {/* silhouette */}
      <circle cx="50" cy="16" r="11" className={base} />
      <rect x="44" y="26" width="12" height="8" className={base} />
      <rect x="30" y="34" width="40" height="66" rx="10" className={base} />
      <rect x="16" y="38" width="12" height="62" rx="6" className={base} />
      <rect x="72" y="38" width="12" height="62" rx="6" className={base} />
      <rect x="32" y="100" width="16" height="110" rx="7" className={base} />
      <rect x="52" y="100" width="16" height="110" rx="7" className={base} />
      {/* shoulders */}
      <ellipse cx="25" cy="42" rx="8" ry="7" className={s(view === "front" ? "shoulders" : "reardelts")} />
      <ellipse cx="75" cy="42" rx="8" ry="7" className={s(view === "front" ? "shoulders" : "reardelts")} />
      {/* upper arms */}
      <rect x="17" y="52" width="10" height="22" rx="5" className={s(view === "front" ? "biceps" : "triceps")} />
      <rect x="73" y="52" width="10" height="22" rx="5" className={s(view === "front" ? "biceps" : "triceps")} />
      {view === "front" ? (
        <>
          <rect x="33" y="38" width="16" height="18" rx="5" className={s("chest")} />
          <rect x="51" y="38" width="16" height="18" rx="5" className={s("chest")} />
          <rect x="40" y="60" width="20" height="36" rx="5" className={s("abs")} />
          <rect x="34" y="112" width="12" height="44" rx="6" className={s("quads")} />
          <rect x="54" y="112" width="12" height="44" rx="6" className={s("quads")} />
          <rect x="35" y="168" width="10" height="30" rx="5" className={s("calves")} />
          <rect x="55" y="168" width="10" height="30" rx="5" className={s("calves")} />
        </>
      ) : (
        <>
          <path d="M34 38 L66 38 L60 90 L40 90 Z" className={s("back")} />
          <rect x="33" y="96" width="15" height="18" rx="7" className={s("glutes")} />
          <rect x="52" y="96" width="15" height="18" rx="7" className={s("glutes")} />
          <rect x="34" y="118" width="12" height="40" rx="6" className={s("hamstrings")} />
          <rect x="54" y="118" width="12" height="40" rx="6" className={s("hamstrings")} />
          <rect x="35" y="166" width="10" height="32" rx="5" className={s("calves")} />
          <rect x="55" y="166" width="10" height="32" rx="5" className={s("calves")} />
        </>
      )}
    </svg>
  );
}

export function MuscleMap({ muscle }: { muscle: string }) {
  const m = MAP[muscle] ?? { primary: [], secondary: [] };
  const tone = (p: Part) =>
    m.primary.includes(p) ? "fill-cyan" : m.secondary.includes(p) ? "fill-violet/70" : "fill-muted-foreground/25";
  return (
    <div className="glass-tile rounded-xl p-3">
      <div className="flex items-center justify-center gap-6">
        <div className="text-center"><Figure view="front" tone={tone} /><p className="text-[10px] text-muted-foreground">Front</p></div>
        <div className="text-center"><Figure view="back" tone={tone} /><p className="text-[10px] text-muted-foreground">Back</p></div>
      </div>
      <div className="mt-2 flex justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-cyan" />Primary</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-violet/70" />Secondary</span>
      </div>
    </div>
  );
}
