import { useMemo, useState } from "react";
import type { WorkoutSession } from "@/lib/types";
import { muscleRecovery, type RecoveryStatus } from "@/lib/recovery";
import { MUSCLE_TILES, muscleImage } from "@/lib/visuals";

const STATUS: Record<RecoveryStatus, { label: string; ring: string; bar: string; text: string }> = {
  fatigued: { label: "Fatigued", ring: "ring-destructive/60", bar: "bg-destructive", text: "text-destructive" },
  recovering: { label: "Recovering", ring: "ring-amber-500/50", bar: "bg-amber-500", text: "text-amber-500" },
  fresh: { label: "Ready", ring: "ring-primary/50", bar: "bg-primary", text: "text-primary" },
  untrained: { label: "Not trained", ring: "ring-border", bar: "bg-muted-foreground/30", text: "text-muted-foreground" },
};

export function RecoveryHeatmap({ sessions }: { sessions: WorkoutSession[] }) {
  const tiles = MUSCLE_TILES.filter((t) => t.muscle !== "Cardio");
  const data = useMemo(() => muscleRecovery(sessions, tiles.map((t) => t.muscle)), [sessions]);
  const [open, setOpen] = useState<string | null>(null);
  const counts = data.reduce<Record<string, number>>((a, d) => ((a[d.status] = (a[d.status] ?? 0) + 1), a), {});
  const selected = data.find((d) => d.muscle === open);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display font-semibold text-lg">Muscle recovery</h2>
          <p className="text-xs text-muted-foreground">Based on your completed sets — 48 h to recover, 72 h after 6+ hard sets.</p>
        </div>
        <div className="flex gap-2 text-xs">
          {(["fatigued", "recovering", "fresh"] as const).map((s) => (
            <span key={s} className={`rounded-full px-2.5 py-1 ring-1 ${STATUS[s].ring} ${STATUS[s].text}`}>
              {STATUS[s].label} · {counts[s] ?? 0}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {data.map((d) => {
          const st = STATUS[d.status];
          const label = tiles.find((t) => t.muscle === d.muscle)?.label ?? d.muscle;
          return (
            <button
              key={d.muscle}
              type="button"
              onClick={() => setOpen(open === d.muscle ? null : d.muscle)}
              aria-pressed={open === d.muscle}
              className={`group rounded-xl overflow-hidden ring-2 ${st.ring} bg-plate text-left transition hover:-translate-y-0.5 ${open === d.muscle ? "ring-offset-2 ring-offset-background" : ""}`}
            >
              <img
                src={muscleImage(d.muscle)}
                alt={`${label} muscles`}
                loading="lazy"
                className={`aspect-square w-full object-cover ${d.status === "untrained" ? "opacity-60 grayscale" : ""}`}
              />
              <div className="bg-card/95 p-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold truncate">{label}</span>
                  <span className={`text-[10px] font-medium ${st.text}`}>{d.status === "untrained" ? "—" : `${d.percent}%`}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${st.bar} transition-all`} style={{ width: `${d.status === "untrained" ? 0 : d.percent}%` }} />
                </div>
                <div className={`mt-1 text-[10px] ${st.text}`}>{st.label}</div>
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-4 glass-tile rounded-xl p-4 text-sm">
          {selected.status === "untrained" ? (
            <p className="text-muted-foreground">No completed sets for this muscle yet.</p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              <div><div className="text-xs text-muted-foreground">Last trained</div><div className="font-semibold">{selected.hoursSince} h ago</div></div>
              <div><div className="text-xs text-muted-foreground">Ready in</div><div className="font-semibold">{selected.hoursLeft ? `${selected.hoursLeft} h` : "Ready now"}</div></div>
              <div><div className="text-xs text-muted-foreground">Sets this week</div><div className="font-semibold">{selected.weeklySets}</div></div>
              {selected.exercises.length > 0 && (
                <div className="sm:col-span-3 text-xs text-muted-foreground">This week: {selected.exercises.join(", ")}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
