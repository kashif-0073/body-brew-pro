import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Timer } from "lucide-react";
import { useStore } from "@/lib/store";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  return `${h ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

/** Floating reminder that a workout is still running, shown on every page except the log itself. */
export function ActiveWorkoutPill() {
  const { state } = useStore();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const active = state.active;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!active || path === "/workout") return null;
  const done = active.exercises.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0);

  return (
    <Link
      to="/workout"
      aria-label="Resume active workout"
      className="fixed inset-x-3 bottom-[84px] md:bottom-6 md:left-auto md:right-6 md:w-[360px] z-40 glass-panel rounded-2xl border border-cyan/40 px-4 py-3 flex items-center gap-3 shadow-lg"
    >
      <span className="relative grid size-9 place-items-center rounded-xl gradient-brand text-ink">
        <Timer className="size-4" />
        <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-cyan animate-pulse" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold truncate">{active.title}</span>
        <span className="block text-xs text-muted-foreground">
          {active.startedAt && now ? fmt(now - active.startedAt) : "In progress"} · {done} sets done
        </span>
      </span>
      <span className="flex items-center text-xs font-semibold text-cyan">
        Resume <ChevronRight className="size-4" />
      </span>
    </Link>
  );
}
